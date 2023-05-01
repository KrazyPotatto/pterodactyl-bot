import { Commands } from "./commands";
import { Client, Partials } from "discord.js";
import type { Interaction } from "discord.js";

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

        await interaction.deferReply();

        slashCommand.run(client, interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);