// =========================
// GPTBARN FRONTEND (CLEAN RESET)
// Stable WebSpeech + GPT chat
// =========================

const API_URL = "https://gptbarn-backend-785674597393.europe-north1.run.app";

// -------------------------
// DOM
// -------------------------
const talkBtn = document.getElementById("talkBtn");
const storyBtn = document.getElementById("storyBtn");
const chat = document.getElementById("chat");
const figure = document.getElementById("figure");
const statusEl = document.getElementById("status");

// -------------------------
// State
// -------------------------
let mode = "chat";
let listening = false;
let recognition;

// -------------------------
// Helpers
// -------------------------
function setStatus(text) {
  if (statusEl) statusEl.innerText = text;
  console.log("[STATUS]", text);
}

function addMessage(text) {
  if (!chat) return;

  const div = document.createElement("div");
  div.className = "message";
  div.innerText = text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function setFigure(state) {
  if (!figure) return;

  figure.classList.remove("listening", "speaking");
  if (state) figure.classList.add(state);
}

// -------------------------
// Mode switch
// -------------------------
if (storyBtn) {
  storyBtn.addEventListener("click", () => {
    mode = "story";
    addMessage("📖 Historie-modus aktivert");
    setStatus("Historie-modus");
  });
}

// -------------------------
// Speech Recognition
// -------------------------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Denne nettleseren støtter ikke tale.");
} else {
  recognition = new SpeechRecognition();

  recognition.lang = "no-NO";
  recognition.interimResults = false;
  recognition.continuous = false;

  // START
  recognition.onstart = () => {
    listening = true;
    setStatus("🎤 Lytter...");
    if (talkBtn) talkBtn.disabled = true;
    setFigure("listening");
  };

  // END
  recognition.onend = () => {
    listening = false;
    setStatus("Klar");
    if (talkBtn) talkBtn.disabled = false;
    setFigure(null);
  };

  // ERROR
  recognition.onerror = (e) => {
    console.error("Speech error:", e);

    listening = false;
    if (talkBtn) talkBtn.disabled = false;
    setFigure(null);

    if (e.error === "network") {
      setStatus("Mikrofon ustabil – prøv igjen");
    } else {
      setStatus("Mikrofon-feil: " + e.error);
    }
  };

  // RESULT
  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;

    addMessage("🧒 " + text);
    setStatus("🤖 Tenker...");

    try {
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
      setStatus("Klar");

      if (data.audioUrl) {
        const audio = new Audio(API_URL + data.audioUrl);

        setFigure("speaking");

        audio.play();

        audio.onended = () => {
          setFigure(null);
        };
      }
    } catch (err) {
      console.error(err);
      setStatus("Server-feil");
      addMessage("⚠️ Klarte ikke kontakte AI");
    }
  };

  // -------------------------
  // Button
  // -------------------------
  if (talkBtn) {
    talkBtn.addEventListener("click", () => {
      if (listening) return;

      setStatus("Starter mikrofon...");

      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.error("Start error:", e);
          setStatus("Kunne ikke starte mikrofon");
        }
      }, 150);
    });
  }
}
