// =========================
// GPTBARN FRONTEND (PROD CLEAN + STABLE SPEECH)
// Optimized for Android tablets + WebSpeech API quirks
// =========================

const API_URL = "[https://gptbarn-backend-785674597393.europe-north1.run.app](https://gptbarn-backend-785674597393.europe-north1.run.app)";

const talkBtn = document.getElementById("talkBtn");
const storyBtn = document.getElementById("storyBtn");
const chat = document.getElementById("chat");
const figure = document.getElementById("figure");
const statusEl = document.getElementById("status");

let mode = "chat";
let listening = false;
let recognition;
let retryCount = 0;
const MAX_RETRIES = 2;

// -------------------------
// UI helpers
// -------------------------
function setStatus(text) {
if (statusEl) statusEl.innerText = text;
console.log("STATUS:", text);
}

function addMessage(text) {
if (!chat) return;
const el = document.createElement("div");
el.className = "message";
el.innerText = text;
chat.appendChild(el);
chat.scrollTop = chat.scrollHeight;
}

function setFigureState(state) {
if (!figure) return;
figure.classList.remove("listening", "speaking");
if (state) figure.classList.add(state);
}

function retryStartRecognition() {
if (retryCount >= MAX_RETRIES) return;
retryCount++;

setStatus("Prøver mikrofon igjen...");

setTimeout(() => {
try {
recognition.start();
} catch (e) {
console.error("Retry start failed", e);
}
}, 800);
}

// -------------------------
// Mode
// -------------------------
if (storyBtn) {
storyBtn.addEventListener("click", () => {
mode = "story";
addMessage("📖 Historie-modus aktivert");
setStatus("Historie-modus");
});
}

// -------------------------
// Speech recognition setup
// -------------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
alert("Denne nettleseren støtter ikke tale.");
} else {
recognition = new SpeechRecognition();
recognition.lang = "no-NO";
recognition.interimResults = false;
recognition.continuous = false;

recognition.onstart = () => {
listening = true;
retryCount = 0;
setStatus("🎤 Lytter...");
if (talkBtn) talkBtn.disabled = true;
setFigureState("listening");
};

recognition.onend = () => {
listening = false;
setStatus("Klar");
if (talkBtn) talkBtn.disabled = false;
setFigureState(null);
};

recognition.onerror = (e) => {
console.error("Speech error", e);

```
listening = false;
if (talkBtn) talkBtn.disabled = false;
setFigureState(null);

if (e.error === "network") {
  setStatus("Mikrofon ustabil – prøver igjen...");
  retryStartRecognition();
  return;
}

setStatus("Mikrofon-feil: " + e.error);
```

};

recognition.onresult = async (event) => {
const text = event.results[0][0].transcript;

```
addMessage("🧒 " + text);

try {
  setStatus("🤖 Tenker...");

  const res = await fetch(API_URL + "/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text,
      mode
    })
  });

  if (!res.ok) throw new Error("API error " + res.status);

  const data = await res.json();

  addMessage("🤖 " + data.text);

  if (data.audioUrl) {
    const audio = new Audio(API_URL + data.audioUrl);
    setFigureState("speaking");

    audio.play();

    audio.onended = () => {
      setFigureState(null);
    };
  }

  setStatus("Klar");

} catch (err) {
  console.error(err);
  setStatus("Server-feil");
  addMessage("⚠️ Klarte ikke kontakte AI");
}
```

};

// -------------------------
// Button handler (Android stable start)
// -------------------------
if (talkBtn) {
  talkBtn.addEventListener("click", () => {
    if (listening) return;

    setStatus("Starter mikrofon...");

    setTimeout(() => {
      try {
        recognition.start();
      } catch (e) {
        console.error("Start error", e);
        setStatus("Kunne ikke starte mikrofon");
      }
    }, 150);
  });
}
