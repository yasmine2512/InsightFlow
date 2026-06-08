import DashboardLayout from "../components/Layout";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";

const orders = [
  { id: "#3210", date: "2026-04-03", customer: "Olivia Martin", email: "olivia@example.com", product: "Pro Plan", amount: "$49.00", status: "Completed" },
  { id: "#3209", date: "2026-04-03", customer: "Ava Johnson", email: "ava@example.com", product: "Starter Kit", amount: "$29.00", status: "Processing" },
  { id: "#3208", date: "2026-04-02", customer: "Michael Chen", email: "michael@example.com", product: "Enterprise", amount: "$199.00", status: "Completed" },
  { id: "#3207", date: "2026-04-02", customer: "Sofia Davis", email: "sofia@example.com", product: "Pro Plan", amount: "$49.00", status: "Pending" },
  { id: "#3206", date: "2026-04-01", customer: "Lucas Brown", email: "lucas@example.com", product: "Starter Kit", amount: "$29.00", status: "Completed" },
  { id: "#3205", date: "2026-04-01", customer: "Emma Wilson", email: "emma@example.com", product: "API Access", amount: "$19.00", status: "Completed" },
  { id: "#3204", date: "2026-03-31", customer: "James Lee", email: "james@example.com", product: "Enterprise", amount: "$199.00", status: "Refunded" },
  { id: "#3203", date: "2026-03-31", customer: "Isabella Garcia", email: "isabella@example.com", product: "Pro Plan", amount: "$49.00", status: "Completed" },
];

const statusColor = {
  Completed: "bg-success/10 text-success",
  Processing: "bg-primary/10 text-primary",
  Pending: "bg-warning/10 text-warning",
  Refunded: "bg-destructive/10 text-destructive",
};

export default function Orders() {
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
      
        const res = await axios.get(`${API_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
           params: { page: 1,limit: 10}
        })
        // setProfile(res.data)
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        // navigate("/login");
      }
    }
const { data, isLoading, error } = useQuery({ queryKey: ["products", id], queryFn: fetchProfile, staleTime: 1000 * 60 * 5 });

  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading products</p>;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">Track and manage all orders</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10" />
          </div>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Filter</Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{o.id}</td>
                    <td className="p-4 text-muted-foreground">{o.date}</td>
                    <td className="p-4">
                      <div>{o.customer}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="p-4">{o.product}</td>
                    <td className="p-4 font-medium">{o.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[o.status]}`}>{o.status}</span>
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