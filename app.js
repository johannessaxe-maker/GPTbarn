// =========================
// GPTBARN FRONTEND (app.js)
// CLEAN + FIXED VERSION
// =========================

const API_URL = "[https://gptbarn-backend-785674597393.europe-north1.run.app](https://gptbarn-backend-785674597393.europe-north1.run.app)";

const talkBtn = document.getElementById("talkBtn");
const storyBtn = document.getElementById("storyBtn");
const chat = document.getElementById("chat");
const figure = document.getElementById("figure");
const statusEl = document.getElementById("status");

let currentMode = "chat";
let isListening = false;

function logStatus(msg) {
if (statusEl) statusEl.innerText = msg;
console.log("STATUS:", msg);
}

function addMessage(text) {
if (!chat) return;
const div = document.createElement("div");
div.className = "message";
div.innerText = text;
chat.appendChild(div);
chat.scrollTop = chat.scrollHeight;
}

if (storyBtn) {
storyBtn.addEventListener("click", () => {
currentMode = "story";
addMessage("📖 Historiemodus aktivert");
});
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
alert("SpeechRecognition støttes ikke i denne nettleseren.");
} else {
const recognition = new SpeechRecognition();
recognition.lang = "no-NO";
recognition.interimResults = false;
recognition.continuous = false;

recognition.onstart = () => {
isListening = true;
logStatus("🎤 Lytter...");
if (talkBtn) talkBtn.disabled = true;
figure?.classList.add("listening");
};

recognition.onend = () => {
isListening = false;
logStatus("🙂 Klar");
if (talkBtn) talkBtn.disabled = false;
figure?.classList.remove("listening");
};

recognition.onerror = (event) => {
console.error("Speech error:", event.error);
logStatus("⚠️ Mikrofon-feil: " + event.error);
isListening = false;
if (talkBtn) talkBtn.disabled = false;
};

recognition.onresult = async (event) => {
const text = event.results[0][0].transcript;

```
addMessage("🧒 " + text);

try {
  logStatus("🤖 Tenker...");

const response = await fetch(`${API_URL}/api/chat`, {
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

  if (!response.ok) {
    throw new Error("API error: " + response.status);
  }

  const data = await response.json();

  addMessage("🌙 " + data.text);

  if (data.audioUrl) {
    const audio = new Audio(API_URL + data.audioUrl);

    figure?.classList.add("speaking");

    audio.play();

    audio.onended = () => {
      figure?.classList.remove("speaking");
    };
  }

  logStatus("🙂 Klar");

} catch (err) {
  console.error(err);
  logStatus("⚠️ Feil mot server");
  addMessage("⚠️ Klarte ikke kontakte serveren");
}
```

};

if (talkBtn) {
talkBtn.addEventListener("click", () => {
if (isListening) return;

```
  try {
    recognition.start();
  } catch (e) {
    console.error("Start error:", e);
  }
});
```

}
}
