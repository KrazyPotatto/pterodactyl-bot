import { CommandInteraction, ChatInputApplicationCommandData, Client } from 'discord.js';
import { List } from './commands/list';
import { Power } from './commands/power';
import { Status } from './commands/status';
import { Authorize } from './commands/authorize';

export const Commands: Command[] = [List, Status, Power, Authorize];
export interface Command extends ChatInputApplicationCommandData {
    ephemeral: boolean,
    run: (client: Client, interaction: CommandInteraction) => void;
}
