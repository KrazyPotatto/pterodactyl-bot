import { Command } from "@/commands";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { hasPermission, addUserPermission, removeUserPermission } from "@/database/permission-manager";

export const Authorize: Command = {
    name: 'authorize',
    description: 'ADMIN ONLY: Toggle a user\'s access to specific servers',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "identifier",
            description: "The server's identifier",
            type: ApplicationCommandOptionType.String,
            required: true,
        }, 
        {
            name: "person",
            description: "To whom grant / deny permission to the server",
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    ephemeral: true,
    async run(client, interaction) {
        if(interaction.user.id != process.env.DISCORD_ADMIN_ID) {
            interaction.editReply("It seems you may not have the necessary permissions to execute this action.");
            return;
        }

        const identifier = interaction.options.get("identifier")?.value?.toString().trim() + "";
        const user = interaction.options.getUser("person");

        if(!user) {
            interaction.editReply("No user was passed. Cannot continue.");
            return;
        }
        
        let exists = await hasPermission({userId: user.id, serverId: identifier});
        if(exists) {
            await removeUserPermission({userId: user.id, serverId: identifier});
            interaction.editReply("User no longer have permission to the server.");
        } else {
            await addUserPermission({userId: user.id, serverId: identifier});
            interaction.editReply("User now have access to the server.");
        }
    },
}