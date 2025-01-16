import { Command } from "@/commands";
import { ApplicationCommandType, ApplicationCommandOptionType, ComponentType } from "discord.js";
import { clientHttp } from '@/api/http';
import type { ServerData, ServerResource } from "@/api/types";
import { hasPermission } from "@/database/permission-manager";
import PowerEmbed, { getPowerStatus, PowerStatus } from "@/utils/PowerEmbed";
import { getButtons, powerButtonsCollector } from "@/utils/PowerButtons";

export const Status: Command = {
    name: 'status',
    description: 'Returns the current status of a server',
    options: [
        {
            name: "identifier", 
            description: "The identifier of the server", 
            type: ApplicationCommandOptionType.String, 
            required: true
        }
    ],
    type: ApplicationCommandType.ChatInput,
    ephemeral: false,
    async run(client, interaction) {
        let identifier = interaction.options.get("identifier")?.value;
        identifier = identifier?.toString().trim() + "";

        if(!await hasPermission({userId: interaction.user.id.toString(), serverId: identifier})) {
            interaction.editReply("It seems you may not have the necessary permissions to execute this action.");
            return;
        }

        let resources = await clientHttp.get(`/servers/${identifier}/resources`);
        let server = await clientHttp.get(`/servers/${identifier}`);
        if(resources.status == 200 && server.status == 200) {
            let res :ServerResource  = resources.data;
            let ser :ServerData      = server.data;
            const currentStatus: PowerStatus = getPowerStatus(res.attributes.current_state);
            const buttons = getButtons(currentStatus);

            let message = await interaction.editReply({
                embeds: [PowerEmbed(currentStatus, ser)],
                components: buttons.length == 0 ? [] : [
                    { // Had some TS issues with the ActionRowBuilder, so I manually set the action row
                        type: ComponentType.ActionRow,
                        components: buttons
                    }
                ],
            });

            const collector = message.createMessageComponentCollector({componentType: ComponentType.Button, time: 300_000});
            collector.on('collect', powerButtonsCollector.bind({
                identifier, message, ser
            }));
            collector.on('end', () => interaction.editReply({components: []}).catch(() => {}));
        } else {
            interaction.editReply("An unknown error occured");
        }
    },
}