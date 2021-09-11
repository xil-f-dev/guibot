process.on("unhandledRejection", (error) => {
	console.error("Unhandled promise rejection:", error);
});

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { initClient } = require("./client");
let client;

app.use("/", express.static(__dirname + "/public"));

io.on("connection", (socket) => {
	console.log("New socket connexion");

	socket.on("logging", async (token) => {
		client = await initClient(token);
		socket.emit("logged", {
			token: token,
		});
	});
	socket.on("start_discuss", async (ch_id) => {
		if (ch_id.trim().length !== 18) return socket.emit("discuss_started", { error: "Invalid channel id" });
		const channel = await client.channels.cache.find((ch) => ch.id == parseInt(ch_id.trim())).fetch();
		if (!channel) return socket.emit("discuss_started", { error: "Please enter a valid channel id" });
		if (!channel.isText()) return socket.emit("discuss_started", { error: "Only text channels are allowed !" });
		const messages = await channel.messages.fetch({ limit: 30 });
		let msgs = [];
		messages.forEach((msg) => {
			msgs.push({
				author: {
					name: msg.author.tag,
					color: msg.member.displayHexColor,
					avatar: msg.author.displayAvatarURL(),
				},
				content: msg.content,
				date: msg.createdAt,
			});
		});
		socket.emit("discuss_started", { messages: msgs.reverse() });

		socket.on("message_send", (message) => {
			if (!message.trim().length >= 1) return;
			channel.send(message);
			const last_message = channel.messages.cache.first();
			socket.send("new_message", {
				author: {
					name: last_message.author.tag,
					color: last_message.member.displayHexColor,
					avatar: last_message.author.displayAvatarURL(),
				},
				content: last_message.content,
				date: last_message.createdAt,
			});
		});

		client.on("messageCreate", (message) => {
			if (!message.channel.id == channel.id) return;
			socket.emit("new_message", {
				author: {
					name: message.author.tag,
					color: message.member.displayHexColor,
					avatar: message.author.displayAvatarURL(),
				},
				content: message.content,
				date: message.createdAt,
			});
		});
	});
});

server.listen(3000, () => {
	console.log("listening on *:3000");
});
