import { Command } from "@/commands";
import { ApplicationCommandType, ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { clientHttp } from '@/api/http';
import type { ServerResource, ServerData } from "@/api/types";
import { hasPermission } from "@/database/permission-manager";
import PowerEmbed, { getPowerStatus } from "@/utils/PowerEmbed";
const WebSocket  = require('ws');

export const Power: Command = {
    name: 'power',
    description: 'Execute Power Action on a server',
    options: [
        {
            name: "identifier", 
            description: "The identifier of the server", 
            type: ApplicationCommandOptionType.String, 
            required: true
        },
        {
            name: "signal",
            description: "The power action to execute",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {name: 'Start', value: 'start'},
                {name: 'Stop', value: 'stop'},
                {name: 'Restart', value: 'restart'},
                {name: 'Kill', value: 'kill'}
            ]
        }
    ],
    type: ApplicationCommandType.ChatInput,
    ephemeral: false,
    async run(client, interaction) {
        const identifier = interaction.options.get("identifier")?.value?.toString().trim() + "";

        if(!await hasPermission({userId: interaction.user.id.toString(), serverId: identifier})) {
            interaction.editReply("It seems you may not have the necessary permissions to execute this action.");
            return;
        }

        const signal = interaction.options.get("signal")?.value?.toString().trim() + "";

        let currentReq = (await clientHttp.get(`/servers/${identifier}/resources`));
        let server = await clientHttp.get(`/servers/${identifier}`);
        let current: ServerResource = currentReq.data;
        let ser :ServerData      = server.data;

        if(currentReq.status != 200 || server.status != 200) {
            interaction.editReply("An error occured while attempting to send the `"+signal+"` power action.");
            return;
        }

        if(!["running", "offline"].includes(current.attributes.current_state)) {
            interaction.editReply("This server is already executing a power action. Aborting...");
            return;
        }

        if(current.attributes.current_state == "running" && signal == "start") {
            interaction.editReply("This server is currently running and " + signal + " cannot be executed");
            return;
        }

        if(current.attributes.current_state == "offline" && (signal == "stop" || signal == "restart"  || signal == "kill")) {
            interaction.editReply("This server is currently offline and " + signal + " cannot be executed");
            return;
        }

        let power = await clientHttp.post(`/servers/${identifier}/power`, {
            signal
        });
        
        if(power.status == 204) {
            interaction.editReply("The `"+signal+"` power action successfully sent to the server.");
            await listenWebsocketForServer(interaction, identifier, getDesiredState(signal), ser);
        } else {
            interaction.editReply("An error occured while attempting to send the `"+signal+"` power action.");
        }
    },
}

function getDesiredState(signal :string): string {
    switch(signal) {
        case 'kill': 
        case 'stop':
            return "offline";
        case 'restart':
        case 'start':
            return "running";
        default:
            return "";
    }
}

async function getWebsocketToken(identifier: string) :Promise<WsToken> {
    return (await clientHttp.get(`/servers/${identifier}/websocket`)).data;
}

async function listenWebsocketForServer(interaction: CommandInteraction, identifier:string, desiredState: string, server: ServerData) {
    let token = await getWebsocketToken(identifier);
    
    const authMsg = (token :string) => {
        let msg :WsMsg = {
            event: "auth",
            args: [token]
        };
        return msg;
    };
    let ws = new WebSocket(token.data.socket, {origin: process.env.PTERODACTYL_URL});

    ws.on('open', () => {
        ws.send(JSON.stringify(authMsg(token.data.token)));
    });

    ws.on('message', (data: any) => {
        let msg: WsMsg = JSON.parse(data.toString());
        if(msg.event == "status") {
            let newStatus = msg.args![0];
            interaction.editReply({embeds: [PowerEmbed(getPowerStatus(newStatus!), server)]});
            if(newStatus == desiredState) {
                ws.close();
            }
        } else if(msg.event == "token expiring") {
            getWebsocketToken(identifier).then(res => {
                token = res;
                ws.send(JSON.stringify(authMsg(res.data.token)));
            });
        }
    });
}

type WsMsg = {
    event: string,
    args?: string[]|[null]
}

type WsToken = {
    data: {
        token: string,
        socket: string
    }
}