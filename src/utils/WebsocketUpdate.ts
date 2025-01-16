import { CommandInteraction, ButtonInteraction, ComponentType, Collector, InteractionCollector } from "discord.js";
import PowerEmbed, { getPowerStatus, PowerStatus } from "@/utils/PowerEmbed";
import { clientHttp } from '@/api/http';
import type { ServerData } from "@/api/types";
import { getButtons, powerButtonsCollector } from "./PowerButtons";
const WebSocket  = require('ws');

async function getWebsocketToken(identifier: string) :Promise<WsToken> {
    return (await clientHttp.get(`/servers/${identifier}/websocket`)).data;
}

export async function listenWebsocketForServer(interaction: CommandInteraction|ButtonInteraction, identifier:string, desiredState: string, server: ServerData) {
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
            const newStatus = msg.args![0];
            const status: PowerStatus = getPowerStatus(newStatus!);

            const edit = interaction.editReply({
                embeds: [PowerEmbed(status, server)],
                components: newStatus != desiredState ? [] : [
                    { // Had some TS issues with the ActionRowBuilder, so I manually set the action row
                        type: ComponentType.ActionRow,
                        components: getButtons(status),
                    }
                ]
            });
            
            if(newStatus == desiredState) {
                ws.close();
                edit.then(message => {
                    const collector = message.createMessageComponentCollector({componentType: ComponentType.Button, time: 300_000});
                    collector.on('collect', powerButtonsCollector.bind({
                        identifier, message, ser: server
                    }));
                    collector.on('end', () => interaction.editReply({components: []}).catch(() => {}));
                });
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