import { useAuth } from "@/hooks/use-auth";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { containsBlockedWord } from "./blockedWords";
import "./skybuddy.css";

type SkyBuddyModalProps = {
  onClose: () => void;
  username?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous?: boolean;
  onstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const SkyScene = lazy(() => import("./SkyScene"));

const clouds = [
  { top: "14%", width: 120, height: 40, duration: "27s", delay: "-2s", opacity: 0.48 },
  { top: "26%", width: 165, height: 52, duration: "33s", delay: "-11s", opacity: 0.6 },
  { top: "40%", width: 100, height: 34, duration: "25s", delay: "-7s", opacity: 0.55 },
  { top: "58%", width: 150, height: 50, duration: "31s", delay: "-15s", opacity: 0.52 },
  { top: "74%", width: 115, height: 38, duration: "29s", delay: "-4s", opacity: 0.43 },
];

function extractTranscript(event: any): { text: string; isFinal: boolean } {
  if (!event?.results) return { text: "", isFinal: false };

  let finalTranscript = "";
  let interimTranscript = "";

  for (let i = event.resultIndex ?? 0; i < event.results.length; i += 1) {
    const result = event.results[i];
    const part = result?.[0]?.transcript || "";
    if (result?.isFinal) {
      finalTranscript += `${part} `;
    } else {
      interimTranscript += `${part} `;
    }
  }

  if (finalTranscript.trim()) {
    return { text: finalTranscript.trim(), isFinal: true };
  }

  return { text: interimTranscript.trim(), isFinal: false };
}

export default function SkyBuddyModal({ onClose, username }: SkyBuddyModalProps) {
  const { user, getAuthHeader } = useAuth();

  const displayName = username?.trim() || user?.username?.trim() || "Explorer";
  const greetingText = `Hello ${displayName}, what's in your mind today?`;

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const greetedRef = useRef(false);
  const speechTokenRef = useRef(0);
  const lastTranscriptRef = useRef("");
  const handledTranscriptRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState(greetingText);
  const [userSpeech, setUserSpeech] = useState("");
  const [botReply, setBotReply] = useState("");
  const [typedInput, setTypedInput] = useState("");

  const recognitionSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    speechTokenRef.current += 1;
    const currentToken = speechTokenRef.current;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.82;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => /english male|google uk english male|microsoft david|microsoft mark/i.test(voice.name)) ||
      voices.find((voice) => /male|david|guy|alex/i.test(voice.name)) ||
      voices.find((voice) => /english|en-/i.test(`${voice.name} ${voice.lang}`));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (currentToken !== speechTokenRef.current) return;
      setIsSpeaking(true);
      setStatusText("SkyBuddy is speaking...");
    };

    utterance.onend = () => {
      if (currentToken !== speechTokenRef.current) return;
      setIsSpeaking(false);
      setStatusText("Tap the mic or type a question 😊");
    };

    utterance.onerror = () => {
      if (currentToken !== speechTokenRef.current) return;
      setIsSpeaking(false);
      setStatusText("I had trouble speaking clearly. Please try again.");
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const getFallbackReply = useCallback((text: string) => {
    if (containsBlockedWord(text)) {
      return "Let’s talk about something fun and safe 😊";
    }
    return "Great question! I'm having a connection hiccup. Please try again in a moment.";
  }, []);

  const fetchSkyReply = useCallback(async (text: string) => {
    if (!user) {
      return getFallbackReply(text);
    }

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ userId: user.id, message: text }),
      });

      if (!response.ok) {
        return getFallbackReply(text);
      }

      const data = await response.json();
      return data?.response || getFallbackReply(text);
    } catch {
      return getFallbackReply(text);
    }
  }, [user, getAuthHeader, getFallbackReply]);

  const handleUserPrompt = useCallback(async (text: string) => {
    if (!text.trim()) {
      setStatusText("I couldn't catch that. Tap the mic and try again 😊");
      return;
    }

    recognitionRef.current?.stop();
    setIsListening(false);
    setUserSpeech(text);
    setStatusText("SkyBuddy is thinking...");

    const response = await fetchSkyReply(text);
    setBotReply(response);

    window.setTimeout(() => {
      speakText(response);
    }, 120);
  }, [fetchSkyReply, speakText]);

  const createRecognition = useCallback(() => {
    if (!recognitionSupported) return null;

    const RecognitionClass = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) as SpeechRecognitionCtor;
    const recognition = new RecognitionClass();

    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onstart = () => {
      handledTranscriptRef.current = false;
      lastTranscriptRef.current = "";
      setIsListening(true);
      setStatusText("Listening...");
    };

    recognition.onresult = (event) => {
      const { text, isFinal } = extractTranscript(event);
      if (!text.trim()) return;

      lastTranscriptRef.current = text;
      setStatusText(`Heard: ${text}`);

      if (isFinal && !handledTranscriptRef.current) {
        handledTranscriptRef.current = true;
        void handleUserPrompt(text);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setStatusText("Mic permission was denied. Please allow mic access to chat.");
        return;
      }
      if (event.error === "no-speech") {
        setStatusText("No speech detected. Try one more time!");
        return;
      }
      if (event.error === "audio-capture") {
        setStatusText("I can't access the microphone. Please check your mic settings.");
        return;
      }
      setStatusText("I couldn't catch that. Tap the mic and try again 😊");
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!handledTranscriptRef.current && lastTranscriptRef.current.trim()) {
        handledTranscriptRef.current = true;
        void handleUserPrompt(lastTranscriptRef.current.trim());
      }
    };

    return recognition;
  }, [recognitionSupported, handleUserPrompt]);

  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    if (!greetedRef.current) {
      setStatusText(greetingText);
      setBotReply(greetingText);
      speakText(greetingText);
      greetedRef.current = true;
    }

    recognitionRef.current = createRecognition();

    return () => {
      body.style.overflow = previousOverflow;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      if (stopTimerRef.current) {
        window.clearTimeout(stopTimerRef.current);
      }
    };
  }, [greetingText, speakText, createRecognition]);

  const startListening = async () => {
    if (!recognitionSupported) {
      setStatusText("Voice input is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      setStatusText("Please wait, SkyBuddy is speaking.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
      if (!recognitionRef.current) {
        setStatusText("Voice input is not supported on this browser.");
        return;
      }
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatusText("Listening stopped. Tap mic to start again.");
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // keep going: some browsers allow SpeechRecognition even if getUserMedia preflight fails
    }

    try {
      window.speechSynthesis?.cancel();
      setUserSpeech("");
      setStatusText("Listening...");
      recognitionRef.current.start();
    } catch {
      setStatusText("Mic is blocked or busy. Please allow microphone access and try again.");
      return;
    }

    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
    }

    stopTimerRef.current = window.setTimeout(() => {
      recognitionRef.current?.stop();
    }, 10000);
  };

  const sendTypedPrompt = () => {
    const prompt = typedInput.trim();
    if (!prompt) {
      setStatusText("Type a question first 😊");
      return;
    }

    setTypedInput("");
    void handleUserPrompt(prompt);
  };

  return (
    <div className="fixed inset-0 z-[100] skybuddy-modal-fade">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-blue-200">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />

        {clouds.map((cloud, index) => (
          <div
            key={`cloud-${index}`}
            className="skybuddy-cloud"
            style={{
              top: cloud.top,
              width: `${cloud.width}px`,
              height: `${cloud.height}px`,
              opacity: cloud.opacity,
              animationDuration: cloud.duration,
              animationDelay: cloud.delay,
            }}
          />
        ))}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-sky-700 shadow-lg transition-transform hover:scale-105"
          aria-label="Close SkyBuddy"
        >
          ✕
        </button>

        <div className="relative z-10 flex h-full items-center justify-center px-4 py-14">
          <div className="skybuddy-panel w-full max-w-md rounded-[2rem] bg-white/65 p-6 text-center shadow-[0_20px_70px_rgba(56,189,248,0.28)] backdrop-blur-sm">
            <Suspense fallback={<div className="h-[260px]" />}>
              <SkyScene isSpeaking={isSpeaking} />
            </Suspense>

            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => void startListening()}
                disabled={isSpeaking}
                className={`skybuddy-mic-btn ${isListening ? "skybuddy-mic-listening" : ""}`}
                aria-label="Start voice input"
              >
                🎙️
              </button>
              <p className="text-sm font-medium text-sky-700">{statusText}</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendTypedPrompt();
                  }
                }}
                placeholder="Type your question (e.g., what is gravity?)"
                className="skybuddy-input"
                aria-label="Type message to SkyBuddy"
              />
              <button type="button" onClick={sendTypedPrompt} className="skybuddy-send-btn" aria-label="Send typed message">
                Send
              </button>
            </div>

            <div className="mt-5 space-y-3 text-left">
              {userSpeech && <div className="skybuddy-bubble skybuddy-user-bubble">You: {userSpeech}</div>}
              {botReply && <div className="skybuddy-bubble skybuddy-bot-bubble">SkyBuddy: {botReply}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
