import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const id = user?.userId;
  const token = user?.token;

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
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsgContent = inputMessage;
    setInputMessage('');

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
  return response.data;
    }catch(error){
    console.error("Failed to create chat:", error);
    throw error;
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
    console.error("Failed to create chat:", error);
    throw error;
  }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Message List Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Loading messages...</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask something about your dashboard..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}