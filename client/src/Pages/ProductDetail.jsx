import { useParams, Link,useNavigate, } from "react-router-dom";
import DashboardLayout from "../components/Layout";
import { ArrowLeft, Edit, Trash2, BarChart3, Users, DollarSign ,ShoppingCart,ShoppingBag,Package,
  PackageCheck,TrendingDown,TrendingUp,PackageOpen, } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState,useEffect } from "react";
import axios from "axios"; 
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import AddOrderPopup from "./CreateOrder";
import { DeleteDialog } from "./DeleteDialog";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import AddProductPopup from "./AddProduct";

export default function ProductDetail() {
  const { user} = useAuth();
  const isAdmin = user?.isAdmin;
  const {productid} = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openE, setOpenE] = useState(false);
  const token = user?.token;
  const userId = user?.userId;
  const queryClient = useQueryClient();
  const [product, setProduct] = useState(null);
  const [stats,setstats] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [succesOpen, setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");
  const [errorOpen,setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fetchProduct = async () => {
           try {
             const res = await axios.get(`${API_URL}/api/products/${userId}/detail/${productid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
             console.log(res.data);
             setProduct(res.data.result.product);
             console.log(res.data.result.analytics);
             setstats(res.data.result.analytics);
           } catch (err) {
             console.error("Product not Found", err);
             navigate(-1);
           }
         }
       useEffect(() => {
         fetchProduct();
       }, [productid])
     
       if (!product) return <div>Loading...</div>
    const handleDeleteConfirm = async () => {
  try {
    const res = await axios.delete(`${API_URL}/api/products/${userId}/product/${deleteTarget}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDeleteTarget(null);
    queryClient.invalidateQueries(["productsStats",userId]);
    queryClient.invalidateQueries(["productlist",userId]);
    setSuccessMessage(res.data.message);
    setSuccessOpen(true);
  } catch (err) {
   console.error("Failed to delete product", err);
   setDeleteTarget(null);
   setErrorMessage(err.response?.data?.message ||"Failed to delete product" )
   setErrorOpen(true);
  }
  }
  const metrics = [
  { label: "Month Revenu", value: "$"+stats.revenueThisMonth,
    change:stats.growthPercentage,up:stats.growthPercentage >= 0, icon: DollarSign },
  { label: "Unit Sold", value: stats.unitsSold, icon: BarChart3 },
  { label: "Stock", value: product.stock, icon: Package },
];
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
                  <div className="flex items-center justify-between">
                    <h1 className="font-heading text-2xl font-bold">{product.name}</h1>
                    <div className="flex gap-2">
                      <>
                      <Button variant="outline" size="sm" onClick={() => setOpenE(true)}
                      ><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                        <AddProductPopup
                      open={openE}
                      setOpen={setOpenE}
                      mode="edit"
                      initialData = {product}
                      onSave={fetchProduct}
                    /></>
                      <Button variant="outline" size="sm" aria-label="Delete product"
                       className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteTarget(product._id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <div className="font-heading text-xl font-bold text-primary mt-2">${product.price}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              <span  className="font-heading font-semibold mb-4">SKU : {product.sku}</span>
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

        <Button  size="sm" className="gradient-primary text-primary-foreground p-4 " onClick={() => setOpen(true)}>
        <ShoppingBag className="w-3 h-3 mr-1 text-primary-foreground" />Create Order</Button>
        <AddOrderPopup
        open={open}
        setOpen={setOpen}
        productId={product._id}
        productPrice={product.price}
        onSave={fetchProduct}
        />
          </div>

       <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <m.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{m.label}</span>
            </div>
            <div className="font-heading text-xl font-bold">{m.value}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${m.up && m.label != "Stock Alert" ? "text-success" : "text-destructive"} `}>
                {m.label === "Month Revenu"? (m.up ? <TrendingUp className="w-3 h-3 " />: <TrendingDown className="w-3 h-3" />):(<div/>)}
                {m.label === "Month Revenu"? (m.change +"% From last month"):(<></>)}
              </div>
          </div>
        ))}


      </div>
        </div>
        <DeleteDialog 
              open={deleteTarget !== null}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeleteTarget(null)}
              Page = "The Product"
            />
        <ErrorDialog
              open={errorOpen}
              title="Create Error"
              message={errorMessage}
              actionLabel="Okay"
              onClose={() => setErrorOpen(false)}
                    />
        <SuccessDialog
                open={succesOpen}
                message={successMessgae}
                onClose={() => {
                  setSuccessOpen(false);
                  navigate(-1);
                }}
              />                  
      </div>
  );
}
