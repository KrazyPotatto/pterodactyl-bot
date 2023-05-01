import { Commands } from "./commands";
import { Client, Partials } from "discord.js";
import type { Interaction } from "discord.js";
import {isAxiosError, AxiosError} from 'axios';

console.log("Starting bot...");
// Import .env files
import dotenv from "dotenv";
dotenv.config();
dotenv.config({path: '.env.local', override: true});

const client = new Client({
    intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 1048576, 2097152],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on("ready", async() => {

    await client.application?.commands.set(Commands);

    console.log("Bot is now online!");
});

client.on("interactionCreate", async(interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        const slashCommand = Commands.find(c => c.name === interaction.commandName);
        if (!slashCommand) {
            interaction.followUp({ content: "An error has occurred" });
            return;
        }

        await interaction.deferReply({ephemeral: true});

        try {
            slashCommand.run(client, interaction);
        } catch (error) {
            interaction.editReply("An unknown error occured");
            if(isAxiosError(error)) {
                let err: AxiosError = error;
                console.error(err.response);
            } else {
                console.error(error);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);