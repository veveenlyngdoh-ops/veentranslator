const LANGUAGES = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bg", name: "Bulgarian" },
  { code: "ca", name: "Catalan" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian" },
  { code: "tl", name: "Filipino" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "ko", name: "Korean" },
  { code: "lo", name: "Lao" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "mk", name: "Macedonian" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sr", name: "Serbian" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "yi", name: "Yiddish" },
];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const sourceLangEl = document.getElementById("sourceLang");
const targetLangEl = document.getElementById("targetLang");
const sourceTextEl = document.getElementById("sourceText");
const targetTextEl = document.getElementById("targetText");
const translateBtn = document.getElementById("translateBtn");
const swapBtn      = document.getElementById("swapBtn");
const speakSource  = document.getElementById("speakSource");
const speakTarget  = document.getElementById("speakTarget");
const micBtn       = document.getElementById("micBtn");
const clearBtn     = document.getElementById("clearBtn");
const copyBtn      = document.getElementById("copyBtn");
const charCount    = document.getElementById("charCount");
const statusMsg    = document.getElementById("statusMsg");

// ── Populate dropdowns ────────────────────────────────────────────────────────
function populateLangs() {
  LANGUAGES.forEach(({ code, name }) => {
    sourceLangEl.add(new Option(name, code));
    targetLangEl.add(new Option(name, code));
  });
  sourceLangEl.value = "en";
  targetLangEl.value = "ja";
}
populateLangs();

// ── Char counter ──────────────────────────────────────────────────────────────
sourceTextEl.addEventListener("input", () => {
  if (sourceTextEl.value.length > 5000) {
    sourceTextEl.value = sourceTextEl.value.slice(0, 5000);
  }
  charCount.textContent = `${sourceTextEl.value.length} / 5000`;
});

// ── Swap languages & text ─────────────────────────────────────────────────────
swapBtn.addEventListener("click", () => {
  [sourceLangEl.value, targetLangEl.value] = [targetLangEl.value, sourceLangEl.value];
  const tmp = sourceTextEl.value;
  sourceTextEl.value = targetTextEl.value;
  targetTextEl.value = tmp;
  charCount.textContent = `${sourceTextEl.value.length} / 5000`;
  setStatus("");
});

// ── Clear ─────────────────────────────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  sourceTextEl.value = "";
  targetTextEl.value = "";
  charCount.textContent = "0 / 5000";
  setStatus("");
});

// ── Copy ──────────────────────────────────────────────────────────────────────
copyBtn.addEventListener("click", async () => {
  if (!targetTextEl.value) return;
  try {
    await navigator.clipboard.writeText(targetTextEl.value);
    setStatus("Copied to clipboard.");
  } catch {
    setStatus("Could not copy — please copy manually.");
  }
});

// ── Translate (MyMemory free API) ─────────────────────────────────────────────
async function translate() {
  const text = sourceTextEl.value.trim();
  if (!text) { setStatus("Please enter some text first."); return; }

  translateBtn.disabled = true;
  setStatus("Translating...");
  targetTextEl.value = "";

  const langPair = `${sourceLangEl.value}|${targetLangEl.value}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.responseStatus === 200) {
      targetTextEl.value = data.responseData.translatedText;
      setStatus("Translation complete.");
    } else {
      setStatus("Translation failed: " + (data.responseDetails || "Unknown error."));
    }
  } catch (err) {
    setStatus("Network error — check your connection and try again.");
    console.error(err);
  } finally {
    translateBtn.disabled = false;
  }
}

translateBtn.addEventListener("click", translate);

// Ctrl+Enter shortcut
sourceTextEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) translate();
});

// ── Text-to-Speech ────────────────────────────────────────────────────────────
function speak(text, langCode) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = langCode;

  // Try to find the best matching voice
  const voices = window.speechSynthesis.getVoices();
  const base = langCode.split("-")[0];
  const match =
    voices.find(v => v.lang === langCode) ||
    voices.find(v => v.lang.startsWith(base));
  if (match) utt.voice = match;

  window.speechSynthesis.speak(utt);
}

// Voices load asynchronously in some browsers
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

speakSource.addEventListener("click", () => speak(sourceTextEl.value, sourceLangEl.value));
speakTarget.addEventListener("click", () => speak(targetTextEl.value, targetLangEl.value));

// ── Speech Recognition (mic) ──────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.lang = sourceLangEl.value;
    try {
      recognition.start();
      micBtn.classList.add("active");
      setStatus("Listening... speak now.");
    } catch (e) {
      setStatus("Mic already active or unavailable.");
    }
  });

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    sourceTextEl.value = transcript;
    charCount.textContent = `${transcript.length} / 5000`;
    setStatus("Speech captured. Translating...");
    translate();
  };

  recognition.onerror = (e) => {
    micBtn.classList.remove("active");
    const msgs = {
      "no-speech": "No speech detected. Try again.",
      "not-allowed": "Microphone access denied.",
      "network": "Network error during recognition.",
    };
    setStatus(msgs[e.error] || `Mic error: ${e.error}`);
  };

  recognition.onend = () => micBtn.classList.remove("active");

} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition not supported in this browser";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setStatus(msg) {
  statusMsg.textContent = msg;
}
