import DashboardLayout from "../components/Layout";
import { Search,Filter,Download,DollarSign,TrendingUp,TrendingDown, Package, ShoppingCart, Users} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";


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
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err);
        throw err;
      }
    }
const { data, isLoading, error } = useQuery({ queryKey: ["products", id], queryFn: fetchProfile, staleTime: 1000 * 60 * 5 });

  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading products</p>;
  const LS = data.productsKPI[0].lowStock;
  const OS = data.productsKPI[0].outOfStock;
  const IV = data.productsKPI[0].inventoryValue;

  const stats = [
  { label: "Active Products", value: "$"+ data.activeproducts,change: data.growth,growth:true, up: data.growth>= 0, icon: Package },
  { label: "Low Stock", value: LS, up: LS> 0,growth:false, stock:LS > 0, icon: ShoppingCart },
  { label: "Out Of Stock", value: OS,stock:OS > 0,growth:false, stock:OS > 0, icon: Package },
  { label: "Inventory Value", value: "$"+IV ,growth:false,stock: false, icon: DollarSign },
];
  const products = data.productslist;
  return (

    
      <div className="space-y-6">
      <div className="relative">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all products
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
              <div className={`font-heading text-2xl font-bold ${ !s.stock ? "text" : "text-destructive"}`}>{s.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${s.up && s.growth ? "text-success" : "text-destructive"}`}>
                {s.growth? (s.up ? <TrendingUp className="w-3 h-3 " /> : <TrendingDown className="w-3 h-3" /> ):(<div/>)}
                {s.change && s.growth} 
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10" />
          </div>
          <Button
          className=" right-0">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Sold</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Revenu</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Active</th>
                </tr>
              </thead>
              <tbody>
                {products.map((o) => (
                  <tr key={o._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="text-left p-4 font-medium">{o.name}</td>
                    <td className="text-left p-4 ">${o.price}</td>
                    <td className="text-left p-4"><div>{o.stock}</div></td>
                    <td className="text-left p-4">{o.category}</td>
                    <td className="text-left p-4 font-medium">{o.sold}</td>
                    <td className="text-left p-4">{o.revenue} </td>
                    <td className="text-left p-4" > 
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.isActive ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{o.isActive ? "Yes" : "No"}</span>
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