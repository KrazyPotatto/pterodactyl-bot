import { Command } from "../commands";
import { ApplicationCommandType } from "discord.js";
import { applicationHttp } from '../api/http';
import type { List as ListType, ServerData } from "src/api/types";

export const List: Command = {
    name: 'list',
    description: 'Returns the list of all servers',
    type: ApplicationCommandType.ChatInput,
    async run(client, interaction) {

        let response = await applicationHttp.get("/servers");
        if(response.status == 200) {
            let typed : ListType<ServerData> = response.data;
            let servers = typed.data.map(d => d.attributes.identifier + " | " + d.attributes.name).join("\r\n");
            interaction.editReply("```" + servers + "```");

        } else {
            interaction.editReply("An unknown error occured");
        }
    },
}