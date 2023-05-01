import { CommandInteraction, ChatInputApplicationCommandData, Client } from 'discord.js';
import { List } from './commands/list';

export const Commands: Command[] = [List];
export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}
