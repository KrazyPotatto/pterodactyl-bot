import { Command } from "../commands";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { clientHttp } from '../api/http';
import type { ServerData, ServerResource } from "src/api/types";

export const Status: Command = {
    name: 'status',
    description: 'Returns the list of all servers',
    options: [
        {
            name: "identifier", 
            description: "The identifier of the server", 
            type: ApplicationCommandOptionType.String, 
            required: true
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async run(client, interaction) {
        let identifier = interaction.options.get("identifier")?.value;
        identifier = identifier?.toString().trim();

        let resources = await clientHttp.get(`/servers/${identifier}/resources`);
        let server = await clientHttp.get(`/servers/${identifier}`);
        if(resources.status == 200 && server.status == 200) {
            let res :ServerResource  = resources.data;
            let ser :ServerData      = server.data;
            
            interaction.editReply(getStatusEmoji(res.attributes.current_state) +" > **" + ser.attributes.name + "** is *" + res.attributes.current_state + "*.");

        } else {
            interaction.editReply("An unknown error occured");
        }
    },
}

function getStatusEmoji(status: string): string {
    return status.toLowerCase() == "running" ? "✅" : "🛑";
}