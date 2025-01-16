import { ButtonBuilder, ButtonInteraction, ButtonStyle, Message } from "discord.js";
import { PowerStatus } from "@/utils/PowerEmbed";
import { clientHttp } from "@/api/http";
import { ServerData } from "@/api/types";
import { listenWebsocketForServer } from "./WebsocketUpdate";

export const getButtons = function(currentStatus: PowerStatus) {
    switch(currentStatus) {
        case "ONLINE":
            return [restartButton().toJSON(), stopButton().toJSON(), killButton().toJSON()];
        case "OFFLINE":
            return [startButton().toJSON()];
        default:
            return []; // Only when STARTING or STOPPING right now
    }
}

export const startButton = () => new ButtonBuilder().setCustomId('start').setLabel('Start').setStyle(ButtonStyle.Success);
export const stopButton = () => new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Secondary);
export const restartButton = () => new ButtonBuilder().setCustomId('restart').setLabel('Restart').setStyle(ButtonStyle.Primary);
export const killButton = () => new ButtonBuilder().setCustomId('kill').setLabel('Kill').setStyle(ButtonStyle.Danger);

export const getDesiredState = (signal :string): string => {
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

export async function powerButtonsCollector (this: {identifier: string, message: Message, ser: ServerData}, c: ButtonInteraction) {
    if(this.message.interactionMetadata?.user.id !== c.user.id) {
        c.reply({
            ephemeral: true,
            content: 'Only the original user can use the power buttons.'
        });
        return;
    }

    const signal = c.customId;

    let power = await clientHttp.post(`/servers/${this.identifier}/power`, {
        signal
    });

    try{
        await this.message.delete();
    } catch(_) {}

    if (power.status == 204) {
        await c.reply("The `"+signal+"` power action successfully sent to the server.");
        await listenWebsocketForServer(c, this.identifier, getDesiredState(signal), this.ser);
    } else {
        c.reply('An error occured while attempting to send power signal.')
    }
}