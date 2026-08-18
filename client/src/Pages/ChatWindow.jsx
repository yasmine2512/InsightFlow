import { useState, useEffect, useRef } from 'react';
import { Bot , Send , User , AlertCircle} from "lucide-react";
import { ErrorDialog } from './ErrorDialog';
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const messagesEndRef = useRef(null);
  const [error,setError] = useState("");
  const [errorOpen,setErrorOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const id = user?.userId;
  const token = user?.token;

  useEffect(() => {
    setRateLimitError(false);
  }, [chatId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await getMessageHistory(chatId);
        if (isMounted) setMessages(data);
      } catch (error) {
        console.error("Error fetching message history", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [chatId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages,loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading || rateLimitError) return;

    const userMsgContent = inputMessage;
    setInputMessage('');
    setRateLimitError(false);
    // Optimistically update UI with user message
    const tempUserMessage = { role: 'user', content: userMsgContent, id: Date.now() };
    setMessages((prev) => [...prev, tempUserMessage]);
    setLoading(true);

    try {
      // Post message to backend and receive assistant reply
      const response = await postMessage(chatId, userMsgContent);

      setMessages((prev) => [...prev, response.assistantMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMsg = error?.response?.data?.message || error?.message || "";
      if (error?.response?.status === 429 ){
        setRateLimitError(true);
      } else{
        setError(errorMsg);
        setErrorOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

   async function getMessageHistory(chatId) {
    try{
    const response = await axios.get(
    `${API_URL}/api/chats/${id}/messages/${chatId}`,
    {headers: { Authorization: `Bearer ${token}` }}
  );
  console.log(response.data)
  return response.data;
    }catch(error){
    setError(error.response?.data?.message);
    setErrorOpen(true);
  }
  }


   async function postMessage(chatId, content) {
    try{
    const response = await axios.post(
    `${API_URL}/api/chats/${id}/messages/${chatId}`,
    {content},
    {headers: { Authorization: `Bearer ${token}` }}
  );
    return response.data;
    }catch(error){
    setError(error.response?.data?.message);
    setErrorOpen(true);
  }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-2">
            <Bot className="w-8 h-8 text-primary/60 mb-1" />
            <p>Start a conversation with the InsightFlow AI Assistant.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={cn(
                "flex items-start gap-3 max-w-[80%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-sidebar-accent text-sidebar-foreground border border-border"
                )}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground border border-border rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-foreground border border-border flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-none bg-muted border border-border text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rate Limit Banner Area */}
      {rateLimitError && (
        <div className="px-4 py-2.5 bg-destructive/10 border-t border-destructive/20 flex items-center justify-center gap-2 text-destructive text-sm font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You&apos;ve reached your daily AI message limit.</span>
        </div>
      )}

      {/* Input Form Area */}
      <div className="p-3 border-t border-border bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={rateLimitError ? "Daily limit reached for today..." : "Type your message to AI Assistant..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading || rateLimitError}
            className={cn(
              "flex-1 bg-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all",
              rateLimitError && "opacity-60 cursor-not-allowed bg-muted"
            )}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading || rateLimitError}
            className="p-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl transition-colors shadow-xs shrink-0 flex items-center justify-center"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
        <ErrorDialog
                      open={errorOpen}
                      title="Create Error"
                      message={error}
                      actionLabel="Okay"
                      onClose={() => setErrorOpen(false)}
                            />
    </div>
  );
}