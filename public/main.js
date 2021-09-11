window.addEventListener("load", () => {
	var socket = io();
	const form = document.querySelector(".input_form");
	const input = document.querySelector(".token_input");
	const messages_container = document.querySelector(".messages_container");
	input.value = localStorage.getItem("token") || "";

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		form.classList.add("waiting");
		if (input.value.trim().length < 1) return;
		socket.emit("logging", input.value);
	});

	socket.on("logged", (data) => {
		document.querySelector(".form_wrapper").classList.add("hidden");
		input.value = "";
		localStorage.setItem("token", data.token);
	});

	document.querySelector(".start_discuss_btn").addEventListener("click", () => {
		socket.emit("start_discuss", document.querySelector(".id_discuss_input").value);
	});

	socket.on("discuss_started", (data) => {
		if (data.error) return alert(data.error);
		document.querySelectorAll(".discuss_start").forEach((e) => (e.style.display = "none"));
		console.log(data.messages);
		data.messages.forEach((message) => addMessage(message));

		document.querySelector(".message_form").addEventListener("click", (e) => {
			e.preventDefault();
			let message = document.querySelector(".message_content").value.trim();
			if (!message.length >= 1) return;
			document.querySelector(".message_content").value = "";
			socket.emit("message_send", message);
		});
		socket.on("new_message", (message) => {
			console.log("test");
			addMessage(message);
		});
	});
	const addMessage = (msg) => {
		messages_container.innerHTML += `
				<div class="message">
					<div class="avatar" style="--avatar-url: url('${msg.author.avatar}')"></div>
					<div class="message_right">
						<div class="msg_headers">
							<span class="author" style="color: ${msg.author.color}">
								${msg.author.name}
							</span>
							<span class="date">${msg.date}</span>
						</div>
						<div class="content">${msg.content || "Non supported message type"}</div>
					</div>
				</div>
			`;
		messages_container.scrollTop = messages_container.scrollHeight;
	};
});
