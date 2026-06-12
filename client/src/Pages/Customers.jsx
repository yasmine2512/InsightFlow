import DashboardLayout from "../components/Layout";
import { Search, Filter, Download ,DollarSign,TrendingUp, TrendingDown,Package, ShoppingCart, Users,RefreshCw,UserCheck} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const fillCustomerMonths = (data) => {
  const result = [];
  const monthNames = ["Jan", "Feb", "Mar","Apr", "May", "Jun",
    "Jul", "Aug", "Sep","Oct", "Nov", "Dec"];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const existing = data.find( (item) =>
        item._id.year === year &&
        item._id.month === month);
    result.push({name: monthNames[month - 1],value: existing ? existing.totalcustomers : 0});
  }
  return result;
};
const spendingDistribution = (data) => {
 const buckets = [0, 100, 500, 1000, 5000];
  return buckets.map((amount) => {
    const existing = data.find((item) => item._id === amount );
    return {
      name: `$${amount}`,
      value: existing ? existing.count : 0
    }; });
};

const statusColor = {
  Active: "bg-success/10 text-success",
  Cancelling: "bg-warning/10 text-warning",
};

export default function Customers() {
   const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

    const fetchStats = async () => {
      const token = localStorage.getItem("token");
        if (!token) {
      navigate("/login");
      return;
    }
      try {
      
        const res = await axios.get(`${API_URL}/api/customers/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
           params: { page: 1,limit: 10}
        })
        // setProfile(res.data)
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
    const fetchCustomers = async ({page,search}) => {
      const token = localStorage.getItem("token");
        if (!token) {
      navigate("/login");
      return;
    }
      try {
      
        const res = await axios.get(`${API_URL}/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
           params: { page,limit: 10,search}
        })
        // setProfile(res.data)
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
    const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState(search);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);
  return () => clearTimeout(timer);
}, [search]);
useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch]);
const { data, isLoadingstats, errorstats } = useQuery({ queryKey: ["customers", id], queryFn: fetchStats, staleTime: 1000 * 60 * 5 });
const [currentPage, setCurrentPage] = useState(1);
const {  data: customerslist, isLoading, error } = useQuery({
queryKey: ["customerslist", id,currentPage,debouncedSearch],
queryFn: () => fetchCustomers({page:currentPage,search:debouncedSearch}),keepPreviousData: true,staleTime: 1000 * 60 * 5});

  if (isLoading || isLoadingstats) return <div>Loading...</div>
  if (error || errorstats) return <p>Error loading customers</p>;

  const CL7M =fillCustomerMonths(data?.newClast7month || []);
const spendingChartData =spendingDistribution(data?.customersSpendingDistribution || []);
const CLV = data.customerLiftimeValue.toFixed(1);
const stats = [
  { label: "Total Customers", value: data.totalcustomers,growth:false,icon:Users },
  { label: "Active Customers", value: data.activecustomers, change: data.ACgrowth.toFixed(1), 
    up: data.ACgrowth>= 0,growth:true, icon:  UserCheck },
  { label: "Customer Retention Rate", value:data.customerRetentionRate, 
    change:data.CRRgrowth.toFixed(1),up:data.CRRgrowth,growth:true, icon: RefreshCw },
  { label: "Customer Avg Liftime Value", value:"$"+CLV,growth:false, icon:DollarSign },
];
const customers =customerslist.customers.customers;
const rowsPerPage = 10;
const totalcustomers = customerslist.customers.total;
const totalPages = Math.ceil(totalcustomers / rowsPerPage);
const start = (currentPage - 1) * rowsPerPage + 1;
const end = Math.min(currentPage * rowsPerPage,totalcustomers);
  return (
      <div className="space-y-6">
        <div className="relative">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all customers
          </p>
        </div>
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
              <div className={`flex items-center gap-1 text-xs mt-1 ${s.up? "text-success" : "text-destructive"}`}>
                {s.growth? (s.up ? <TrendingUp className="w-3 h-3 " />: <TrendingDown className="w-3 h-3" /> ):(<div/>)}
                {s.growth && s.change + "% From last month"}
              </div>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
         <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h3 className="font-heading font-semibold mb-4">New Customers Last 7 Months</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CL7M}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(172 66% 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h3 className="font-heading font-semibold mb-4">New Customers Last 7 Months</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={spendingChartData}>
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
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hroleden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className=" p-4 font-medium text-muted-foreground">Customer</th>
                  <th className=" p-4 font-medium text-muted-foreground">CreatedAt</th>
                  <th className=" p-4 font-medium text-muted-foreground">Email</th>
                  <th className=" p-4 font-medium text-muted-foreground">Phone</th>
                  <th className=" p-4 font-medium text-muted-foreground">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((o) => (
                  <tr key={o._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>{o.name}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{o.createdAt.split("T")[0]}</td>
                    <td className="p-4">{o.email}</td>
                    <td className="p-4 font-medium">{o.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium">{o.address}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
    <p className="text-sm text-muted-foreground">
      Showing {start}–{end} of {totalcustomers} customers
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