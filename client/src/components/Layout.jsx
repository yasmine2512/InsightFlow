import { Link, useLocation,Outlet } from "react-router-dom";
import { LayoutDashboard, Package,GalleryVertical , ShoppingCart, CreditCard, Settings,Users, LogOut, Menu, X } from "lucide-react";
import { useState ,useEffect} from "react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {

  const location = useLocation();
  const [open, setOpen] = useState(false);
   const {user,logout } = useAuth();
  const isAdmin = user?.isAdmin;
const userId =localStorage.getItem("userId");
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: `/${userId}/dashboard`, adminOnly: true  },
  { label: "Products", icon: Package, to: `/${userId}/products`},
  { label: "Catalog", icon: GalleryVertical , to: `/${userId}/cataloge`},
  { label: "Orders", icon: ShoppingCart, to: `/${userId}/orders`, adminOnly: true  },
  { label: "Cart", icon: ShoppingCart, to: `/${userId}/cart`, userOnly: true},
  { label: "Customers", icon: Users, to: `/${userId}/customers`, adminOnly: true },
  { label: "Subscriptions", icon: CreditCard, to: "/subscriptions" , adminOnly: true },
  { label: "Settings", icon: Settings, to: "/settings"},
];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between mb-8">
          <Link to="/" className="font-heading text-xl font-bold text-sidebar-primary-foreground">
            <span className="text-primary">Insight</span>Flow
          </Link>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.filter(item => {
  if (item.adminOnly && !isAdmin) return false; 
  if (item.userOnly && isAdmin) return false;   
  return true;                                  
}).map((item) => {
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

        <div className="p-3 mt-auto">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors hover:text-red-500">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">JD</div>
        </header>
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
          </main>
        
      </div>
    </div>
  );
}
