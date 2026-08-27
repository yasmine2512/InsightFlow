import ChatWindow from "./ChatWindow";
import { Bot , X ,Plus , Trash2} from "lucide-react";
import { useState , useEffect} from "react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ErrorDialog } from "./ErrorDialog";
import { DeleteDialog } from "./DeleteDialog";

export default function ChatAssistant({closeChat,openModal,closeModal,isModalOpen}) {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { user } = useAuth();
    const id = user?.userId;
    const [errorDialogState, setErrorDialogState] = useState({ open: false, title: "", message: "" });
    const [deleteDialogState, setDeleteDialogState] = useState({ open: false, chatId: null, chatTitle: "" });
    const MAX_CHATS = 10;

   async function getChats() {
    try{
     const response = await api.get(`/api/chats/${id}`);
  return response.data;
  }catch(error){
    console.error("Failed to create chat:", error);
    throw error;
  }
    }

   async function createChat(title) {
    try{
    const response = await api.post(`/api/chats/${id}`,{title});
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

  async function deleteChat(chatId) {
  try {
    await api.delete(`/api/chats/${id}/${chatId}`);
    } catch (error) {
      console.error(
        "Failed to delete chat:",
        error.response?.data || error
      );
    }
  }

  const confirmDeleteChat = async () => {
    const { chatId } = deleteDialogState;
    if (!chatId) return;

    try {
      await deleteChat(chatId);
      const updatedChats = chats.filter(c => c._id !== chatId);
      setChats(updatedChats);
      
      if (activeChatId === chatId) {
        setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
      }
      setDeleteDialogState({ open: false, chatId: null, chatTitle: "" });
    } catch (error) {
      console.error("Failed to delete chat", error);
      setDeleteDialogState({ open: false, chatId: null, chatTitle: "" });
      setErrorDialogState({
        open: true,
        title: "Deletion Failed",
        message: "Could not delete the chat session. Please try again."
      });
    }
  };

    useEffect(() => {
      loadChats();
  }, []);

  const handleCreateChatSubmit = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;
    if (chats.length >= MAX_CHATS) {
      closeModal()
      setErrorDialogState({
        open: true,
        title: "Chat Limit Reached",
        message: `You have reached the maximum limit of ${MAX_CHATS} active chat sessions. Please delete an existing chat to create a new one.`
      });
      return;
    }
    try {
      setIsCreating(true);
      const newChat = await createChat(newChatTitle);
      setChats([newChat, ...chats]);
      console.log(chats);
      setActiveChatId(newChat._id);
      setNewChatTitle('');
      closeModal();
    } catch (error) {
      console.error("Failed to create chat", error);
    } finally {
    setIsCreating(false);
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
                   <div
                      key={chat._id}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition",
                        activeChatId === chat._id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <button
                        onClick={() => setActiveChatId(chat._id)}
                        className="flex-1 text-left truncate mr-2 focus:outline-none"
                      >
                        {chat.title}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialogState({ open: true, chatId: chat._id, chatTitle: chat.title });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
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
          disabled={isCreating} 
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Chat"
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <ErrorDialog
        open={errorDialogState.open}
        onClose={() => setErrorDialogState({ open: false, title: "", message: "" })}
        title={errorDialogState.title}
        message={errorDialogState.message}
        actionLabel="Got it"
      />

      {/* Delete Dialog Integration */}
      <DeleteDialog
        open={deleteDialogState.open}
        onConfirm={confirmDeleteChat}
        onCancel={() => setDeleteDialogState({ open: false, chatId: null, chatTitle: "" })}
        Page="Chat"
      />
        </div>

        

)}