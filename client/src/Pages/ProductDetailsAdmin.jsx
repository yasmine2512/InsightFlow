import { useParams, Link,useNavigate, } from "react-router-dom";
import DashboardLayout from "../components/Layout";
import { ArrowLeft, Edit, Trash2, BarChart3, Users, DollarSign ,ShoppingCart,ShoppingBag,Package,
  PackageCheck,
  PackageOpen, } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState,useEffect } from "react";
import axios from "axios"; 
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
const metrics = [
  { label: "Active Users", value: "1,234", icon: Users },
  { label: "Monthly Revenue", value: "$12,450", icon: DollarSign },
  { label: "Conversion Rate", value: "24.5%", icon: BarChart3 },
];

export default function ProductDetail() {
    const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const {productid} = useParams();
  const navigate = useNavigate();

   const userId = localStorage.getItem("userId");

     const [product, setProduct] = useState(null)
      const API_URL = import.meta.env.VITE_API_URL;
       useEffect(() => {
         const fetchProduct = async () => {
           const token = localStorage.getItem("token");
             if (!token) {
           navigate("/login");
           return;
         }
           try {
             const res = await axios.get(`${API_URL}/api/products/${userId}/detail/${productid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

             setProduct(res.data.product);
           } catch (err) {
             console.error("Product not Found", err);
             navigate(-1);
           }
         }
         fetchProduct()
       }, [productid])
     
       if (!product) return <div>Loading...</div>

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
           ← Back
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
                <div className="flex-1">
                  {isAdmin && <div className="flex items-center justify-between">
                    <h1 className="font-heading text-2xl font-bold">{product.name}</h1>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>}
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <div className="font-heading text-xl font-bold text-primary mt-2">{product.price}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
              <h3 className="font-heading font-semibold mb-4">Features</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full gradient-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* {!isAdmin && <Button  size="sm" className="gradient-primary text-primary-foreground p-4  ><ShoppingBag className="w-3 h-3 mr-1 text-primary-foreground" /> Order</Button>} */}
          </div>

      { isAdmin && <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <m.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{m.label}</span>
            </div>
            <div className="font-heading text-xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>}
        </div>
      </div>
  );
}
