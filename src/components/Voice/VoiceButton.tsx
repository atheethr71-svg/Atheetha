import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  onResult: (text: string) => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.lang = 'en-US';
      recog.interimResults = false;

      recog.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResult(text);
        setIsListening(false);
        speak(`Navigating to ${text}`);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [onResult]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListen = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-x-[-10px] inset-y-[-10px] bg-hud-cyan rounded-full filter blur-xl"
          />
        )}
      </AnimatePresence>
      <button
        id="voice-toggle-btn"
        onClick={toggleListen}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative group",
          isListening ? "bg-hud-cyan scale-110" : "bg-hud-cyan hover:scale-105 glow-cyan"
        )}
      >
        <div className="w-16 h-16 rounded-full border-4 border-black/20 flex items-center justify-center">
          {isListening ? (
            <MicOff className="w-8 h-8 text-black" />
          ) : (
            <Mic className="w-8 h-8 text-black" />
          )}
        </div>
      </button>
      <span className="text-[10px] font-bold tracking-widest uppercase text-hud-cyan opacity-80">
        {isListening ? "Listening..." : "Tap to Speak"}
      </span>
    </div>
  );
};
