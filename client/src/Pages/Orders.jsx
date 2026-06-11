import DashboardLayout from "../components/Layout";
import { Search, Filter, Download ,Package,ShoppingCart,DollarSign,TrendingDown,TrendingUp,CheckCircle2} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip,BarChart ,CartesianGrid,XAxis, YAxis,Bar} from "recharts";

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

export default function Orders() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

    const fetchStats= async () => {
      const token = localStorage.getItem("token");
        if (!token) {
      navigate("/login");
      return;
    }
      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        // navigate("/login");
        throw err;
      }
    }
const fetchOrders= async ({page}) => {
      const token = localStorage.getItem("token");
        if (!token) {
      navigate("/login");
      return;
    }
      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
           params: { page,limit: 10}
        })
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        // navigate("/login");
        throw err;
      }
    }


const { data, isLoadingstats, errorstats } = useQuery({ queryKey: ["orders", id], queryFn: fetchStats, staleTime: 1000 * 60 * 5 });
const [currentPage, setCurrentPage] = useState(1);
const {  data: orderslist, isLoading, error } = useQuery({ queryKey: ["orderslist", id,currentPage],
   queryFn: () => fetchOrders({page:currentPage}),keepPreviousData: true,staleTime: 1000 * 60 * 5});

  if (isLoading || isLoadingstats) return <div>Loading...</div>
  if (error || errorstats) return <p>Error loading orders</p>;
const OG = data.ordersgrowth.toFixed(1);
const AOV = data.averageordervalue.toFixed(1);
const AOVG = data.averageordervalue.toFixed(1);
const FR= data.fulfillmentrate.toFixed(1);
const FRG=data.FRgrowth.toFixed(1);
const ordersData = data.ordersbystatus;
  
   const stats = [
  { label: "Orders", value: data.ordersTM,change:OG,growth:true, up:OG>= 0, icon: Package },
  { label: "Pending Orders", value:0,growth:false, stock: 0, icon: ShoppingCart },
  { label: "Average Order Value", value:AOV,change:AOVG,up:AOVG>0
,growth:true, stock:0, icon: DollarSign },
  { label: "Fulfillment Rate", value:FR ,change:FRG,growth:true,up:FRG>0, icon: CheckCircle2 },
];

const colors = [
    "hsl(172 66% 50%)" ,"hsl(243 75% 59%)" ,"hsl(280 72% 55%)","hsl(38 92% 50%)"
];
const ordersperday = fillMissingDays(data.ordersperday);
const orders = orderslist.orders;

  const rowsPerPage = 10;
  const totalorders = data.totalOrders;
  const totalPages = Math.ceil(totalorders / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage + 1;
const end = Math.min(currentPage * rowsPerPage,totalorders);
  return (
      <div className="space-y-6">

        <div className="relative">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all orders
          </p>
        </div>
      </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className={"font-heading text-2xl font-bold "}>{s.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${s.up && s.growth ? "text-success" : "text-destructive"}`}>
                {s.growth? (s.up ? <TrendingUp className="w-3 h-3 " /> : <TrendingDown className="w-3 h-3" /> ):(<div/>)}
                { s.change } {s.growth && "From last month"}
              </div>
            </div>
          ))}
         
        </div>
         <div className="grid lg:grid-cols-2 gap-6">
           <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                      <h3 className="font-heading font-semibold mb-4">Orders Distribution</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={ordersData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" paddingAngle={3} nameKey="_id">
                            {ordersData.map((entry, i) => <Cell key={i} fill={colors[i]} />)}
                            
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {ordersData.map((p,i) => (
                          <div key={p._id} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
                            {p._id}
                          </div>
                        ))}
                      </div>
                    </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                      <h3 className="font-heading font-semibold mb-4">Orders This Week</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={ordersperday}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                          <Tooltip />
                          <Bar dataKey="value" fill="hsl(172 66% 50%)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" />Filter</Button>
            </div>
            <Button><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
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
              
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">#{o.orderNumber}</td>
                    <td className="p-4">{o.customerName}</td>
                    <td className="p-4"
                  title={o.products.map((p) =>`${p.name} ×${p.quantity || 1}`).join(", ")}
                    >{o.products.slice(0, 1).map((p) => (<span key={p.name}>
                     {p.name}
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
          {/* Pagination Controls */}
  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
    <p className="text-sm text-muted-foreground">
      Showing {start}–{end} of {totalorders} products
    </p>
    <div className="flex items-center gap-1">
      {/* Previous */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
        .reduce((acc, page, idx, arr) => {
          if (idx > 0 && page - arr[idx - 1] > 1) acc.push("...");
          acc.push(page);
          return acc;
        }, [])
        .map((item, idx) =>
          item === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
          ) : (
            <button
              key={item}
              onClick={() => setCurrentPage(item)}
              className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {item}
            </button>
          )
        )}

      {/* Next */}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ›
      </button>
    </div>
  </div>
        </div>
      </div>
  );
}