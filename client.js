module.exports.initClient = (token) => {
	return new Promise((resolve, reject) => {
		const { Client } = require("discord.js");

		const client = new Client({
			disableEveryone: true,
			intents:
				"GUILDS GUILD_MEMBERS GUILD_BANS GUILD_EMOJIS_AND_STICKERS GUILD_INTEGRATIONS GUILD_WEBHOOKS GUILD_INVITES GUILD_VOICE_STATES GUILD_PRESENCES GUILD_MESSAGES GUILD_MESSAGE_REACTIONS GUILD_MESSAGE_TYPING DIRECT_MESSAGES DIRECT_MESSAGE_REACTIONS DIRECT_MESSAGE_TYPING".split(
					" "
				),
		});

		client.on("ready", async (client) => {
			console.log("Logged in as " + client.user.tag);
			resolve(client);
		});

		client.login(token);
	});
};
