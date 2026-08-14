import ChatWindow from "./ChatWindow";
import { Bot , X ,Plus} from "lucide-react";
import { useState , useEffect} from "react";
import { cn } from "../lib/utils";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ChatAssistant({closeChat,openModal,closeModal,isModalOpen}) {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [newChatTitle, setNewChatTitle] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useAuth();
    const id = user?.userId;
    const token = user?.token;

   async function getChats() {
    try{
     const response = await axios.get(
    `${API_URL}/api/chats/${id}`,
    {headers: { Authorization: `Bearer ${token}` }}
  );
  return response.data;
  }catch(error){
    console.error("Failed to create chat:", error);
    throw error;
  }
    }

   async function createChat(title) {
    try{
    const response = await axios.post(
    `${API_URL}/api/chats/${id}`,
    {title},
    {headers: { Authorization: `Bearer ${token}` }}
  );
    return response.data;
    } catch(error){
      console.error("Failed to create chat:", error);
      throw error;
    }
    }


    const loadChats = async () => {
    try {
      const data = await getChats();
      setChats(data);
      if (data.length > 0 && !activeChatId) {
        setActiveChatId(data[0]._id);
      }
    } catch (error) {
      console.error("Failed to load chats", error);
    }
  };

    useEffect(() => {
      loadChats();
  }, []);

  const handleCreateChatSubmit = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;

    try {
      const newChat = await createChat(newChatTitle);
      setChats([newChat, ...chats]);
      console.log(chats);
      setActiveChatId(newChat.id);
      setNewChatTitle('');
      closeModal();
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

    return(
<div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4">
    <div className="w-full max-w-4xl h-[85vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
      
      {/* Modal Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-card">
        <div className="flex items-center gap-2 font-heading font-bold text-base">
          <Bot className="w-5 h-5 text-primary" />
          <span>InsightFlow Assistant</span>
        </div>


              <button 
                onClick={closeChat}
                className="text-muted-foreground hover:text-foreground text-xl font-bold p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Layout (Internal History Sidebar + Chat Window) */}
            <div className="flex flex-1 overflow-hidden">
              
              {/* Internal Chat History Sidebar */}
              <div className="w-1/3 border-r border-border bg-muted/30 flex flex-col">
                <div className="p-3 border-b border-border">
                  <button
                    onClick={openModal}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {chats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => setActiveChatId(chat._id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-lg truncate transition",
                        activeChatId === chat._id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {chat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Chat Window Area */}
              <div className="flex-1 flex flex-col bg-card">
                {activeChatId ? (
                  <ChatWindow chatId={activeChatId} />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
                    Select an existing chat from the sidebar or click &quot;New Chat&quot; to begin.
                  </div>
                )}
              </div>

            </div>
          </div>

           {/* New Chat Title Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-xl p-6 w-96 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-heading font-bold mb-4">Create New Chat Session</h3>
            <form onSubmit={handleCreateChatSubmit}>
              <input
                type="text"
                placeholder="e.g., Subscription Analysis"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition"
                >
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>

        

)}