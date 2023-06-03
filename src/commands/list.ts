import { Command } from "@/commands";
import { ApplicationCommandType } from "discord.js";
import { applicationHttp } from '@/api/http';
import type { List as ListType, ServerData } from "@/api/types";
import { getUsersPermissions } from "@/database/permission-manager";

export const List: Command = {
    name: 'list',
    description: 'Returns the list of all servers',
    type: ApplicationCommandType.ChatInput,
    ephemeral: true,
    async run(client, interaction) {
        let response = await applicationHttp.get("/servers");
        if(response.status == 200) {
            let typed : ListType<ServerData> = response.data;
            let authorized = (await getUsersPermissions(interaction.user.id.toString())).map(x => x.server_id);
            let servers = typed.data.filter(x => authorized.includes(x.attributes.identifier)).map(d => d.attributes.identifier + " | " + d.attributes.name).join("\r\n");
            interaction.editReply("```" + servers + "```");
        } else {
            interaction.editReply("An unknown error occured");
        }
    },
}