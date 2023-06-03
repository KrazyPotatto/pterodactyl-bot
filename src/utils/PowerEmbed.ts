import { ColorResolvable, EmbedBuilder } from "discord.js";
import { ServerData } from "@/api/types";


export enum PowerStatus {
    STARTING = "STARTING",
    RUNNING = "ONLINE",
    STOPPING = "STOPPING",
    OFFLINE = "OFFLINE"
}

export function getPowerStatus(status: string): PowerStatus {
    // @ts-ignore
    return <PowerStatus>PowerStatus[status.toUpperCase()];
}

function getColor(status: PowerStatus): ColorResolvable {
    switch(status) {
        case PowerStatus.RUNNING: 
            return 0x00ff00;
        case PowerStatus.STARTING:
        case PowerStatus.STOPPING:
            return 0xffff00;
        default:
            return 0xff0000;
    }
}


function PowerEmbed(status: PowerStatus, server: ServerData) {
    let embed = new EmbedBuilder()
        .setColor(getColor(status))
        .setTitle(server.attributes.name)
        .addFields({name: "Status", value: status, inline: false});
    if(status == PowerStatus.RUNNING) {
        let allocation = server.attributes.relationships.allocations.data.find(s => s.attributes.is_default);
        embed.addFields({name: "IP Address", value: allocation!.attributes.ip_alias + ":" + allocation!.attributes.port});
    }
    return embed;
}

export default PowerEmbed;