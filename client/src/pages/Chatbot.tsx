import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { KidsCard } from "@/components/kids-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

const suggestedQuestions = [
  "Tell me a fun fact!",
  "What's your favorite animal?",
  "Tell me a joke!",
  "How do rainbows form?",
  "What are stars made of?",
];

export default function Chatbot() {
  const { user, getAuthHeader } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", content: "Hi there! I'm your friendly AI buddy! What would you like to talk about today? Ask me anything fun!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading || !user) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          userId: user.id,
          message: text,
        }),
      });

      const data = await response.json();
      const botMessage: ChatMessage = { role: "bot", content: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [...prev, { role: "bot", content: "Oops! Something went wrong. Let's try again!" }]);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-purple-100 to-blue-100">
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Buddy</h1>
            <p className="text-sm text-muted-foreground">Your friendly chat friend!</p>
          </div>
          <Sparkles className="w-6 h-6 text-yellow-500 ml-auto animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`rounded-full p-2 h-fit ${
              message.role === "user" 
                ? "bg-blue-500" 
                : "bg-gradient-to-r from-purple-500 to-blue-500"
            }`}>
              {message.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <KidsCard className={`max-w-[80%] p-4 ${
              message.role === "user" 
                ? "bg-blue-500 text-white" 
                : "bg-white"
            }`}>
              <p className="text-lg">{message.content}</p>
            </KidsCard>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="rounded-full p-2 bg-gradient-to-r from-purple-500 to-blue-500">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <KidsCard className="p-4 bg-white">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </KidsCard>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(question)}
                className="text-sm"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
            className="text-lg"
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
