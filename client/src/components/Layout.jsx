import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, GalleryVertical, ShoppingCart, CreditCard, Settings, Users, LogOut, Menu, X, Bot, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import ChatWindow from "../Pages/ChatWindow";
import ChatAssistant from "../Pages/ChatAssistant";

export default function DashboardLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [initials, setInitials] = useState("??");
  const username = user?.username;
  const organizationName = user?.organization || "InsightFlow Inc.";
  // Chat Drawer & Management States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: `/dashboard` },
    { label: "Products", icon: Package, to: `/products` },
    { label: "Catalog", icon: GalleryVertical, to: `/catalog` },
    { label: "Orders", icon: ShoppingCart, to: `/orders` },
    { label: "Customers", icon: Users, to: `/customers` },
    { label: "Subscriptions", icon: CreditCard, to: "/subscriptions" },
  ];

  useEffect(() => {
    const parts = (username || "").trim().split(" ");
    const ini =
      parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0]?.[0] ?? "?";

    setInitials(ini.toUpperCase());
  }, [username]);

  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between mb-5">
          <Link to="/" className="font-heading text-xl font-bold text-sidebar-primary-foreground">
            <span className="text-primary">Insight</span>Flow
          </Link>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Chatbot Entry Button inside Main Sidebar */}
        <div className="px-3 mb-2">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary "
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </button>
        </div>

        {/* Profile Section & Sign Out Enclosed in a Box */}
        <div className="p-3 mt-auto border-t border-sidebar-border">
          <div className="bg-sidebar-accent/55 border border-sidebar-border rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-sidebar-foreground truncate">
                    {organizationName}
                  </span>
                </div>
              </div>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "p-2 ml-1 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors shrink-0",
                  location.pathname.startsWith("/settings") && "bg-sidebar-accent text-sidebar-primary"
                )}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
            
            <button 
              onClick={logout} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{initials}</div>
        </header>
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Slide-Over Chatbot Drawer */}
      {isChatOpen && <ChatAssistant 
      closeChat={() => setIsChatOpen(false)}
      openModal={() => setIsModalOpen(true)}
      closeModal={() => setIsModalOpen(false)}
      isModalOpen={isModalOpen}
      />}

    </div>
  );
}