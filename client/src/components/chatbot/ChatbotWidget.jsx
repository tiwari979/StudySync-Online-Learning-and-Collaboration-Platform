import { useContext, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { askChatbotService } from "@/services/chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/auth-context";

export default function ChatbotWidget() {
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatbot_messages");
    return saved ? JSON.parse(saved) : [
      { role: "bot", text: "Hi! I’m StudySync Assistant. Ask me about enrollments, refunds, password reset, instructor publishing, or groups." },
    ];
  });
  const listRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const suggestions = ["How to enroll?", "Refund policy", "Forgot password", "Publish course", "Join groups"];

  useEffect(() => {
    sessionStorage.setItem("chatbot_messages", JSON.stringify(messages));
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // Show a small prompt above the chatbot button after login without hiding the icon
  useEffect(() => {
    if (auth?.authenticate && !sessionStorage.getItem("chatbot_welcome_shown")) {
      setShowPrompt(true);
      sessionStorage.setItem("chatbot_welcome_shown", "1");
      const timer = setTimeout(() => setShowPrompt(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [auth?.authenticate]);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    try {
      const res = await askChatbotService(text);
      if (res.success) {
        setMessages((m) => [...m, { role: "bot", text: res.reply }]);
      } else {
        setMessages((m) => [...m, { role: "bot", text: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: "Network error. Please try again later." }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {showPrompt && (
            <div className="bg-white dark:bg-neutral-900 border rounded-xl shadow-lg px-3 py-2 text-sm text-indigo-700 flex items-center gap-2 animate-fade-in">
              <span>Hey! I’m here to help.</span>
              <button aria-label="Dismiss" className="p-1 rounded hover:bg-muted" onClick={() => setShowPrompt(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            aria-label="Open chatbot"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
            onClick={() => setOpen(true)}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-neutral-900 border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <div className="text-sm font-semibold">StudySync Assistant</div>
              <div className="text-xs text-muted-foreground">Ask your study questions</div>
            </div>
            <button aria-label="Close chatbot" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div ref={listRef} className="px-3 py-3 h-80 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${m.role === "user" ? "bg-indigo-600 text-white" : "bg-muted"} rounded-2xl px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap shadow-sm`}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap">
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:120ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="px-3 pb-2 -mt-1 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-neutral-800 dark:text-neutral-200"
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
