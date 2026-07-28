import { Link } from "react-router-dom";
import DashboardLayout from "../components/Layout";
import { Plus, Search, MoreHorizontal, Currency } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useState ,useEffect} from "react"
import { useParams ,useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AddProductPopup from "./AddProduct";
import { useQuery } from "@tanstack/react-query";

export default function ProductsCatalog() {
  const{user}= useAuth();
  const isAdmin = user?.isAdmin;
  const token = user?.token;
  const id = user?.userId;
   const [open, setOpen] = useState(false)
  //  const [products, setProducts] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
  
       const fetchProducts = async ({page,search}) => {
         try {
          console.log(search)
           const res = await axios.get(`${API_URL}/api/products/${id}/cataloge`, {
             headers: { Authorization: `Bearer ${token}` },
             params: { page,limit: 12,search}
           })
           console.log(res.data)
          return res.data;
         } catch (err) {
           console.error("Unauthorized or token invalid", err)
         }
       }
   const [currentPage, setCurrentPage] = useState(1);
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
  const { data, isLoading, error } = useQuery({ queryKey: ["catalog", id,Currency,debouncedSearch], queryFn:() =>
    fetchProducts({page:currentPage, search:debouncedSearch}),staleTime: 1000 * 60 * 5 });

  if (isLoading) return <div>Loading...</div>
  if (error) return <p>Error loading products</p>;

   const products = data?.products;
   const rowsPerPage = 12;
   const totalproducts = data?.total;
   const totalPages =Math.max(1,Math.ceil(totalproducts / rowsPerPage));
   const start = (currentPage - 1) * rowsPerPage + 1;
   const end = Math.min(currentPage * rowsPerPage,totalproducts);
 console.log("total pages:",totalPages);
  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between align-center">
          <div>
            <h1 className="font-heading text-2xl font-bold mb-3">Products</h1>
            <p className="text-sm text-muted-foreground ">Manage your product catalog</p>
          </div>
        <><Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
          <AddProductPopup
        open={open}
        setOpen={setOpen}
        mode="create"
      /></>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link key={p._id} to={`/catalog/${p._id}`} className="group">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
    <p className="text-sm text-muted-foreground">
      Showing {start}–{end} of {totalproducts} products
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
  );
}
