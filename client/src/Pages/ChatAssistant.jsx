import ChatWindow from "./ChatWindow";
import { Bot, X, Plus, Trash2, Loader2, AlertTriangle , ArrowLeft} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ErrorDialog } from "./ErrorDialog";
import { DeleteDialog } from "./DeleteDialog";
import axios from "axios";

export default function ChatAssistant({ closeChat, openModal, closeModal, isModalOpen }) {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    
    const [isWakingUp, setIsWakingUp] = useState(true);
    const [wakeUpError, setWakeUpError] = useState(false);

    const [mobileView, setMobileView] = useState('list');

    const { user } = useAuth();
    const id = user?.userId;
    const [errorDialogState, setErrorDialogState] = useState({ open: false, title: "", message: "" });
    const [deleteDialogState, setDeleteDialogState] = useState({ open: false, chatId: null, chatTitle: "" });
    const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL;
    const MAX_CHATS = 10;

    async function wakeUpService(isMountedRef) {
        try {
            setIsWakingUp(true);
            setWakeUpError(false);
            await axios.get(`${AI_SERVICE_URL}/health`, {
                timeout: 180000,
            });
            
            if (isMountedRef.current) {
                setIsWakingUp(false);
                loadChats();
            }
        } catch (error) {
            console.error("Failed to wake up AI service:", error);
            if (isMountedRef.current) {
                setIsWakingUp(false);
                setWakeUpError(true);
            }
        }
    }

    useEffect(() => {
        const isMounted = { current: true };
        wakeUpService(isMounted);
        return () => {
            isMounted.current = false;
        };
    }, [id]);


    async function getChats() {
        try {
            const response = await api.get(`/api/chats/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch chats:", error);
            throw error;
        }
    }

    async function createChat(title) {
        try {
            const response = await api.post(`/api/chats/${id}`, { title });
            return response.data;
        } catch (error) {
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
            throw error;
        }
    }

    const confirmDeleteChat = async () => {
        const { chatId } = deleteDialogState;
        if (!chatId || isWakingUp) return;

        try {
            await deleteChat(chatId);
            const updatedChats = chats.filter(c => c._id !== chatId);
            setChats(updatedChats);
            
            if (activeChatId === chatId) {
                setActiveChatId(updatedChats.length > 0 ? updatedChats[0]._id : null);
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

    const handleCreateChatSubmit = async (e) => {
        e.preventDefault();
        if (!newChatTitle.trim() || isWakingUp) return;
        if (chats.length >= MAX_CHATS) {
            closeModal();
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
            setActiveChatId(newChat._id);
            setNewChatTitle('');
            closeModal();
            setMobileView('chat');
        } catch (error) {
            console.error("Failed to create chat", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-xs sm:p-4">
            {/* Main Container: Full screen on mobile (rounded-t-2xl), centered card on sm+ screens */}
            <div className="w-full sm:max-w-4xl h-[100dvh] sm:h-[85vh] bg-card border-0 sm:border border-border sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in relative">
                
                {/* Modal Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-card shrink-0">
                    <div className="flex items-center gap-2 font-heading font-bold text-base">
                        {/* Back button visible on mobile when inside a chat view */}
                        {mobileView === 'chat' && (
                            <button 
                                onClick={() => setMobileView('list')}
                                className="sm:hidden mr-1 text-muted-foreground hover:text-foreground p-1 rounded-md"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
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

                {/* Waking Up Full Overlay / Banner State */}
                {isWakingUp && (
                    <div className="absolute inset-x-0 top-[65px] bottom-0 z-40 bg-card/9cht backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-center p-6">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <div className="space-y-1">
                            <h4 className="font-semibold text-foreground">Waking up AI Assistant...</h4>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Please wait a moment while we initialize the server and load your sessions.
                            </p>
                        </div>
                    </div>
                )}

                {/* Wake-up Error State */}
                {wakeUpError && (
                <div className="absolute inset-x-0 top-[65px] bottom-0 z-40 bg-card flex flex-col items-center justify-center gap-3 text-center p-6">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <div className="space-y-1">
                        <h4 className="font-semibold text-foreground">Failed to connect</h4>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            We couldn't wake up the AI service. Please check your connection and try again.
                        </p>
                    </div>
                    <button
                        onClick={() => wakeUpService({ current: true })} 
                        className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

                {/* Drawer Body Layout (Responsive Sidebar + Chat Window) */}
                <div className="flex flex-1 overflow-hidden relative">
                    

                    <div className={cn(
                        "w-full sm:w-1/3 border-r border-border bg-muted/30 flex flex-col shrink-0 transition-all",
                        mobileView === 'chat' ? "hidden sm:flex" : "flex"
                    )}>
                        <div className="p-3 border-b border-border">
                            <button
                                onClick={openModal}
                                disabled={isWakingUp}
                                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                New Chat
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {chats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => {
                                        if (isWakingUp) return;
                                        setActiveChatId(chat._id);
                                        setMobileView('chat'); // Switch view on mobile when tapped
                                    }}
                                    className={cn(
                                        "group flex items-center justify-between px-3 py-3 sm:py-2 text-sm rounded-lg transition cursor-pointer",
                                        activeChatId === chat._id 
                                            ? 'bg-primary/10 text-primary font-medium' 
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <span className="flex-1 text-left truncate mr-2">
                                        {chat.title}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isWakingUp) return;
                                            setDeleteDialogState({ open: true, chatId: chat._id, chatTitle: chat.title });
                                        }}
                                        disabled={isWakingUp}
                                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-opacity"
                                        title="Delete Chat"
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Chat Window Area 
                        Hidden on mobile when mobileView is 'list'
                    */}
                    <div className={cn(
                        "flex-1 flex-col bg-card h-full overflow-hidden",
                        mobileView === 'list' ? "hidden sm:flex" : "flex"
                    )}>
                        {activeChatId ? (
                            <ChatWindow chatId={activeChatId} isWakingUp={isWakingUp} />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                        <h3 className="text-lg font-heading font-bold mb-4">Create New Chat Session</h3>
                        <form onSubmit={handleCreateChatSubmit}>
                            <input
                                type="text"
                                placeholder="e.g., Subscription Analysis"
                                value={newChatTitle}
                                onChange={(e) => setNewChatTitle(e.target.value)}
                                disabled={isCreating || isWakingUp} 
                                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
                                    disabled={isCreating || isWakingUp}
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4" />
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

            <DeleteDialog
                open={deleteDialogState.open}
                onConfirm={confirmDeleteChat}
                onCancel={() => setDeleteDialogState({ open: false, chatId: null, chatTitle: "" })}
                Page="Chat"
            />
        </div>
    );
}