import DashboardLayout from "../components/Layout";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";

const orders = [
  {id: 1, username: "Olivia Martin",email: "olivia@example.com",role:"user", subscription: "Pro Plan ",status :"active",createdAt: "2026-04-02" },
  { id:2, username: "Ava Johnson", email: "ava@example.com",role:"user" , subscription: "Starter Kit", status: "inactive",createdAt: "2026-04-03"},
  { id:3,username: "Michael Chen", email: "michael@example.com", role :"user", subscription: "Enterprise",status: "active", createdAt: "2026-04-02" },
  { id:4, username: "Sofia Davis", email: "sofia@example.com",role: "admin", subscription: "Pro Plan",status: "inactive" , createdAt: "2026-04-02"},
  {id:5 ,username: "Lucas Brown", email: "lucas@example.com", role: "user",  subscription: "Starter Kit",status: "active" , createdAt: "2026-04-01"},
  {id:6,username: "Emma Wilson", email: "emma@example.com", role: "user",  subscription: "API Access",status: "active" , createdAt: "2026-04-01"},
  {id:7,username: "James Lee", email: "james@example.com" ,role: "user", subscription: "Enterprise",status: "inactive", createdAt: "2026-03-31" },
  {id:8, username: "Isabella Garcia", email: "isabella@example.com",role: "admin",  subscription: "Pro Plan",status: "active", createdAt: "2026-03-31" },
];

const statusColor = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

export default function Customers() {
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
      
        const res = await axios.get(`${API_URL}/api/customers/${id}`, {
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
const { data, isLoading, error } = useQuery({ queryKey: ["customers", id], queryFn: fetchProfile, staleTime: 1000 * 60 * 5 });



  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading products</p>;
  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">Track and manage all users</p>
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

        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hroleden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className=" p-4 font-medium text-muted-foreground">Users</th>
                  <th className=" p-4 font-medium text-muted-foreground">CreatedAt</th>
                  <th className=" p-4 font-medium text-muted-foreground">Subsecription</th>
                  <th className=" p-4 font-medium text-muted-foreground">Role</th>
                  <th className=" p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>{o.username}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{o.createdAt}</td>
                    <td className="p-4">{o.subscription}</td>
                    <td className="p-4 font-medium">{o.role}</td>
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