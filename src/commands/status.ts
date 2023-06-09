import { Command } from "@/commands";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { clientHttp } from '@/api/http';
import type { ServerData, ServerResource } from "@/api/types";
import { hasPermission } from "@/database/permission-manager";
import PowerEmbed, { getPowerStatus } from "@/utils/PowerEmbed";

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
            
            interaction.editReply({embeds: [PowerEmbed(getPowerStatus(res.attributes.current_state), ser)]});
        } else {
            interaction.editReply("An unknown error occured");
        }
    },
}