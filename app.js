const talkBtn = document.getElementById("talkBtn");
const storyBtn = document.getElementById("storyBtn");
const chat = document.getElementById("chat");
const figure = document.getElementById("figure");
let currentMode = "chat";
storyBtn.addEventListener("click", () => {
currentMode = "story";
addMessage("📖 Historiemodus aktivert"
});
);
function addMessage(text) {
const div = document.createElement("div");
div.className = "message";
div.innerText = text;
chat.appendChild(div);
chat.scrollTop = chat.scrollHeight;
}
const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "no-NO";
recognition.interimResults = false;
recognition.onresult = async (event) => {
const text = event.results[0][0].transcript;
addMessage("🧒 "
+ text);
const response = await fetch("https://DIN-CLOUDRUN-URL/api/chat", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
credentials: "include",
body: JSON.stringify({
message: text,
mode: currentMode
})
});
const data = await response.json();
addMessage("🌙 "
+ data.text);
7
playAudio(data.audioUrl);
};
function playAudio(url) {
const audio = new Audio(url);
figure.classList.add("speaking");
audio.play();
audio.onended = () => {
figure.classList.remove("speaking");
};
}
talkBtn.addEventListener("click", () => {
recognition.start();
});