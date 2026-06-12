import { Link } from "react-router-dom";
import DashboardLayout from "../components/Layout";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useState ,useEffect} from "react"
import { useParams ,useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AddProductPopup from "./AddProduct";
import { useQuery } from "@tanstack/react-query";

export default function ProductsCatalog() {
  const { id } = useParams()
  const{user}= useAuth();
  const isAdmin = user?.isAdmin;
   const [open, setOpen] = useState(false)
  //  const [products, setProducts] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
  
       const fetchProducts = async () => {
         const token = localStorage.getItem("token");
           if (!token) {
         navigate("/login");
         return;
       }
         try {
           const res = await axios.get(`${API_URL}/api/products/${id}/cataloge`, {
             headers: { Authorization: `Bearer ${token}` },
             params: { page: 1,limit: 12}
           })
          return res.data;
         } catch (err) {
           console.error("Unauthorized or token invalid", err)
         }
       }
   
  const { data, isLoading, error } = useQuery({ queryKey: ["catalog", id], queryFn: fetchProducts, staleTime: 1000 * 60 * 5 });

  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading products</p>;
   const products = data.products;


  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between align-center">
          <div>
            <h1 className="font-heading text-2xl font-bold mb-3">Products</h1>
            <p className="text-sm text-muted-foreground ">Manage your product catalog</p>
          </div>
        <><Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
          <AddProductPopup
        open={open}
        setOpen={setOpen}
      /></>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link key={p._id} to={`/${id}/products/${p._id}`} className="group">
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-elevated transition-all">
                <div className="flex items-start justify-between mb-4 ">
                  {/* <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">{p.image}</div> */}
                  <img src={p.image} className="w-full h-40 object-cover rounded-lg"/>
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h3 className="font-heading font-semibold group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{p.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-lg">${p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
  );
}
