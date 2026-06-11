import DashboardLayout from "../components/Layout";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users,AlertTriangle} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar ,} from "recharts";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";

const fillMissingMonths = (data) => {
  const now = new Date();
  const result = [];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const existing = data.find((item) => item.year === year && item.month === month );
    result.push({name: monthNames[month - 1],value: existing ? existing.revenue : 0,});
  }
  return result;
};
const fillMissingDays = (data) => {
const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDate = date.toISOString().split("T")[0];
    const existing = data.find(
      (item) => item.day === formattedDate
    );
    result.push({
      name: date.toLocaleDateString("en-US", {
        weekday: "short"
      }),
      value: existing ? existing.orders : 0
    });
  }
  return result;
};

export default function Dashboard() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  useEffect(() => {
  if (!localStorage.getItem("token")) {
    navigate("/login");
  }
}, []);
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
        if (!token) {
      throw new Error("No token");
    }
      try {
      
        const res = await axios.get(`${API_URL}/api/dashboard/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
const { data, isLoading, error } = useQuery({ queryKey: ["overview", id], queryFn: fetchProfile, staleTime: 1000 * 60 * 5 });
  
 

  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading dashboard</p>;
  const Rgrowth = `${data.revenugrowth>= 0 ? "+" : ""}${data.revenugrowth.toFixed(1)}% from last month`;
  const Ogrowth = `${data.ordersgrowth>= 0 ? "+" : ""}${data.ordersgrowth.toFixed(1)}% from last month`;
  const lowstock = data.stockAlert[0].lowStock;
  const outofstock = data.stockAlert[0].outOfStock;
  const Cgrowth = `${data.customersgrowth>= 0 ? "+" : ""}${data.customersgrowth.toFixed(1)}% from last month`;
const stats = [
  { label: "Revenue", value: "$"+ data.revenue,change: Rgrowth, up: data.revenugrowth>= 0, icon: DollarSign },
  { label: "Orders", value: data.orders, change: Ogrowth, up: data.ordersgrowth>= 0, icon: ShoppingCart },
  { label: "Stock Alert", value: lowstock, change:outofstock +" are out of stock",stock:outofstock > 0, icon: AlertTriangle },
  { label: "Customers", value: data.customers, change: Cgrowth, up: data.customersgrowth>= 0 , icon: Users },
];

const revenueData = fillMissingMonths(data.revenuL7M);

const ordersData = fillMissingDays(data.ordersThisWeek);
const recentOrders = data.recentOrders;
const bestProducts = data.bestSellerProducts;
const topCustomers = data.topCustomers;
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
              <div className={`flex items-center gap-1 text-xs mt-1 ${s.up && s.label != "Stock Alert" ? "text-success" : "text-destructive"} ${!s.stock && s.label == "Stock Alert" ? "text-success" : "text-destructive"}`}>
                {s.label != "Stock Alert"? (s.up ? <TrendingUp className="w-3 h-3 " />: <TrendingDown className="w-3 h-3" /> ):(<div/>)}
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
            <h3 className="font-heading font-semibold ">Recent Orders</h3>
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
                  <tr key={o._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">#{o.orderNumber}</td>
                    <td className="p-4">{o.customer.name}</td>
                    <td className="p-4"
                  title={o.products.map((p) =>`${p.product?.name} ×${p.quantity || 1}`).join(", ")}
                    >{o.products.slice(0, 1).map((p) => (<span key={p.product?._id}>
                     {p.product?.name}
                     {p.quantity > 1 && `×${p.quantity}`}
                      </span>) )} 
                      {o.products.length > 1 && (
                      <span className="more">
                      {"  "}+{o.products.length - 1} more
                    </span>
                        )}</td>
                    <td className="p-4">${o.totalPrice}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === "completed" ? "bg-success/10 text-success" :
                        o.status === "pending" ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning"
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
  <div className="p-5 border-b border-border">
    <h3 className="font-heading font-semibold flex items-center justify-center gap-2">
      <Users size={18} className=" text-success"/> Top Customers</h3>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className=" p-4 font-medium text-muted-foreground">Name</th>
          <th className=" p-4 font-medium text-muted-foreground">Email</th>
          <th className=" p-4 font-medium text-muted-foreground">Spent</th>
        </tr>
      </thead>

      <tbody>
        {topCustomers?.slice(0, 5).map((c) => (
          <tr
            key={c.customerId}
            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
          >
            <td className="p-4 font-medium">{c.name}</td>
            <td className="p-4 text-muted-foreground">{c.email}</td>
            <td className="p-4 font-medium">${c.totalSpent}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
<div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
  <div className="p-5 border-b border-border">
    <h3 className="font-heading font-semibold flex items-center justify-center gap-2"><TrendingUp size={18} className="text-success"/> Best Selling Products</h3>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className=" p-4 font-medium text-muted-foreground">Name</th>
          <th className=" p-4 font-medium text-muted-foreground">Price</th>
          <th className=" p-4 font-medium text-muted-foreground">Total Sold</th>
        </tr>
      </thead>

      <tbody>
        {bestProducts?.slice(0, 5).map((p) => (
          <tr
            key={p._id}
            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
          >
            <td className="p-4 font-medium">{p.product?.name}</td>
            <td className="p-4">${p.product?.price}</td>
            <td className="p-4 font-medium">{p.totalSold}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        </div>
      </div>
  );
}