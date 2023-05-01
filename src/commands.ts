import { CommandInteraction, ChatInputApplicationCommandData, Client } from 'discord.js';
import { List } from './commands/list';
import { Power } from './commands/power';
import { Status } from './commands/status';

export const Commands: Command[] = [List, Status, Power];
export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}
