import DashboardLayout from "../components/Layout";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";


export default function Dashboard() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
        if (!token) {
      navigate("/login");
      return;
    }
      try {
      
        const res = await axios.get(`${API_URL}/api/dashboard/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        // setProfile(res.data)
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        // navigate("/login");
      }
    }
const { data, isLoading, error } = useQuery({ queryKey: ["overview", id], queryFn: fetchProfile, staleTime: 1000 * 60 * 5 });
  
 

  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading products</p>;
  const Rgrowth = `${data.revenugrowth>= 0 ? "+" : ""}${data.revenugrowth.toFixed(1)}% from last month`;
  const Ogrowth = `${data.ordersgrowth>= 0 ? "+" : ""}${data.ordersgrowth.toFixed(1)}% from last month`;
  const lowstock = data.stockAlert[0].lowStock;
  const outofstock = data.stockAlert[0].outOfStock;
  const Cgrowth = `${data.customersgrowth>= 0 ? "+" : ""}${data.customersgrowth.toFixed(1)}% from last month`;
const stats = [
  { label: "Revenue", value: "$"+ data.revenue,change: Rgrowth, up: data.revenugrowth>= 0, icon: DollarSign },
  { label: "Orders", value: data.orders, change: Ogrowth, up: data.ordersgrowth>= 0, icon: ShoppingCart },
  { label: "Stock Alert", value: lowstock, change:outofstock +" are out of stock", up: true, icon: Package },
  { label: "Customers", value: data.customers, change: Cgrowth, up: data.customersgrowth>= 0 , icon: Users },
];

const revenueData = [
  { name: "Jan", value: 4000 }, { name: "Feb", value: 3800 }, { name: "Mar", value: 5200 },
  { name: "Apr", value: 4800 }, { name: "May", value: 6100 }, { name: "Jun", value: 5400 },
  { name: "Jul", value: 7200 },
];

const newSingups = [
{id: 1, username: "Olivia Martin",email: "olivia@example.com",role:"user", subscription: "Pro Plan ",status :"active",createdAt: "2026-04-02" },
  { id:2, username: "Ava Johnson", email: "ava@example.com",role:"user" , subscription: "Starter Kit", status: "inactive",createdAt: "2026-04-03"},
  { id:3,username: "Michael Chen", email: "michael@example.com", role :"user", subscription: "Enterprise",status: "active", createdAt: "2026-04-02" },
  { id:4, username: "Sofia Davis", email: "sofia@example.com",role: "admin", subscription: "Pro Plan",status: "inactive" , createdAt: "2026-04-02"},
  {id:5 ,username: "Lucas Brown", email: "lucas@example.com", role: "user",  subscription: "Starter Kit",status: "active" , createdAt: "2026-04-01"},
];

const ordersData = [
  { name: "Mon", value: 44 }, { name: "Tue", value: 55 }, { name: "Wed", value: 41 },
  { name: "Thu", value: 67 }, { name: "Fri", value: 52 }, { name: "Sat", value: 38 }, { name: "Sun", value: 29 },
];

const recentOrders = [
  { id: "#3210", customer: "Olivia Martin", product: "Pro Plan", amount: "$49.00", status: "Completed" },
  { id: "#3209", customer: "Ava Johnson", product: "Starter Kit", amount: "$29.00", status: "Processing" },
  { id: "#3208", customer: "Michael Chen", product: "Enterprise", amount: "$199.00", status: "Completed" },
  { id: "#3207", customer: "Sofia Davis", product: "Pro Plan", amount: "$49.00", status: "Pending" },
  { id: "#3206", customer: "Lucas Brown", product: "Starter Kit", amount: "$29.00", status: "Completed" },
];
  return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${s.up ? "text-success" : "text-destructive"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change} 
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h3 className="font-heading font-semibold mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="hsl(243 75% 59%)" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h3 className="font-heading font-semibold mb-4">Orders This Week</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(172 66% 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border shadow-soft">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className=" p-4 font-medium text-muted-foreground">Order</th>
                  <th className=" p-4 font-medium text-muted-foreground">Customer</th>
                  <th className=" p-4 font-medium text-muted-foreground">Product</th>
                  <th className=" p-4 font-medium text-muted-foreground">Amount</th>
                  <th className=" p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">{o.id}</td>
                    <td className="p-4">{o.customer}</td>
                    <td className="p-4">{o.product}</td>
                    <td className="p-4">{o.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === "Completed" ? "bg-success/10 text-success" :
                        o.status === "Processing" ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning"
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Singups */}
        <div className="bg-card rounded-xl border border-border shadow-soft">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold">New Signups</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className=" p-4 font-medium text-muted-foreground">Users</th>
                  <th className=" p-4 font-medium text-muted-foreground">CreatedAt</th>
                  <th className=" p-4 font-medium text-muted-foreground">Subsecription</th>
                  <th className=" p-4 font-medium text-muted-foreground">Role</th>
                  <th className=" p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {newSingups.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium ">
                       <div>{o.username}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="p-4">{o.createdAt}</td>
                    <td className="p-4">{o.subscription}</td>
                    <td className="p-4">{o.role}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === "active" ? "bg-success/10 text-success" :
                        o.status === "inactive" ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning"
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}