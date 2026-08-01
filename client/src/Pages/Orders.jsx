import DashboardLayout from "../components/Layout";
import { Search, Filter, Download ,Package,ShoppingCart,DollarSign,TrendingDown,TrendingUp,CheckCircle2,Trash2,Plus} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useParams ,  useNavigate} from "react-router-dom"
import { useEffect, useState, useRef} from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip,BarChart ,CartesianGrid,XAxis, YAxis,Bar} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteDialog } from "./DeleteDialog";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import AddOrderPopup2 from "./AddOrderPopup";
import { ImportOrdersModal } from "./ImportOrderModal";
import { useAuth } from "../context/AuthContext";
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
const STATUS_OPTIONS = ["pending", "canceled", "completed"];

function StatusPopover({ currentStatus, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const styles = {
    completed: "bg-success/10 text-success",
    pending:   "bg-primary/10 text-primary",
    canceled:"bg-warning/10 text-warning",
  };

  return (
    <div className="relative inline-block" ref={ref} >
      <button onClick={() => setOpen((v) => !v)}>
        <span className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${styles[currentStatus]}`}>
          {currentStatus}
        </span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Change status</p>
          {STATUS_OPTIONS.filter((s) => s !== currentStatus).map((s) => (
            <button
              key={s}
              onClick={() => { onSelect(s); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                s === "completed" ? "bg-success" :
                s === "pending" ? "bg-primary":
                "bg-warning"
              }`} />
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user} = useAuth();
  const token = user?.token;
  const id = user?.userId;
  const plan = user.plan;
  const [profile, setProfile] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorOpen,setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen,setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");
  const [openOrderModal,setopenOrderModal] = useState(false);
   const [openOrderForm,setopenOrderForm] = useState(false);
  const handleDeleteConfirm = async () => {
  try {
    await axios.delete(`${API_URL}/api/orders/${id}/${deleteTarget}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    queryClient.invalidateQueries(["orderslist", id]);
    queryClient.invalidateQueries(["orders", id]);
    setDeleteTarget(null);
    setSuccessMessage("Order deleted successfully");
    setSuccessOpen(true);
  } catch (err) {
    setDeleteTarget(null);
    setErrorMessage(err.response.data.message);
    setErrorOpen(true);
  }
  }

  const fetchStats= async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
const fetchOrders= async ({page,search,status}) => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
           params: { page,limit: 10,search,status}
        })
        console.log(res.data);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
const fileInputRef = useRef(null);
const [loadingImport, setLoadingImport] = useState(false);
// const handleImportClick = () => {
//   if(!plan ||plan === "free"){
//     navigate("/subscriptions");
//   }else{
//   fileInputRef.current.click();
// }
// };
const handleFileChange = async (file) => {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  try {
    setLoadingImport(true);
    const res = await axios.post(
      `${API_URL}/api/orders/import/${id}`,
      formData,
      {headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },}
    );
    
    queryClient.invalidateQueries(["orders", id]);
    queryClient.invalidateQueries(["customerslist", id]);
    queryClient.invalidateQueries(["customer", id]);
    queryClient.invalidateQueries(["productsStats", id]);
    queryClient.invalidateQueries(["productlist", id]);
    const { created, failed, errors } = res.data;
  if (failed > 0) {
    const issues = errors.map((err) => {
        return `${err.orderRef || "Row"}: ${err.message}`;
      }).join("\n");

    setSuccessMessage(
      `Import completed.\n\n${created} orders created.\n${failed} issues found:\n${issues}`
    );
  } else {
    setSuccessMessage(
      `Import completed successfully. ${created} orders created.`
    );
  }
   setopenOrderModal(false);
   setSuccessOpen(true);
  } catch (err) {
    console.log(err.response?.data?.errors || "no error");
    const errors = err.response?.data?.errors || [];
    const errorMessage = errors
    .map((error) => {
      if (error.row) {
        return `Row error: ${error.message}`;
      }

      return `${error.orderRef}: ${error.message}`;
    })
    .join("\n");
    setopenOrderModal(false);
    setErrorMessage(errorMessage || "Import failed");
    setErrorOpen(true);
  } finally {
    setLoadingImport(false);
  }
};
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState(search);
const STATUS_OPTIONS = ["all", "pending", "completed", "canceled"];
const [open, setOpen] = useState(false);
const [filter, setFilter] = useState("");
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);
  return () => clearTimeout(timer);
}, [search]);
useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch]);
const { data:data,isLoading: isLoadingstats,error: errorstats } = useQuery({ queryKey: ["orders", id], queryFn: fetchStats, staleTime: 1000 * 60 * 5 });
const [currentPage, setCurrentPage] = useState(1);
const {  data: orderslist, isLoading, error } = useQuery({
   queryKey: ["orderslist", id,currentPage,debouncedSearch,filter],
   queryFn: () => fetchOrders({page:currentPage,search:debouncedSearch,status:filter}),keepPreviousData: true,staleTime: 1000 * 60 * 5});
  if (isLoading || !data) return <div>Loading...</div>
  if (error) return <p>Error loading orders</p>;
const OG = data.ordersgrowth.toFixed(1) || 0;
const AOV = data.averageordervalue.toFixed(1) || 0;
const AOVG = data.averageordervalue.toFixed(1) || 0;
const FR= data.fulfillmentrate.toFixed(1) || 0;
const FRG=data.FRgrowth.toFixed(1) || 0;
const ordersData = data.ordersbystatus || [];
const orders = orderslist.orders.orders || [];
const ordersperday = fillMissingDays(data.ordersperday || []);
  const rowsPerPage = 10;
  const totalorders = orderslist.orders.total;
  const totalPages = Math.max(1,Math.ceil(totalorders / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage + 1;
const end = Math.min(currentPage * rowsPerPage,totalorders);
   const stats = [
  { label: "Orders This Month", value: data.ordersTM,change:OG,growth:true, up:OG>= 0, icon: Package },
  { label: "All Orders", value:totalorders,growth:false, icon: ShoppingCart },
  { label: "Average Order Value", value:AOV,change:AOVG,up:AOVG>0
,growth:true, stock:0, icon: DollarSign },
  { label: "Fulfillment Rate", value:FR ,change:FRG,growth:true,up:FRG>0, icon: CheckCircle2 },
];

const colors = [
   "hsl(243 75% 59%)" , "hsl(172 66% 50%)" ,"hsl(38 92% 50%)","hsl(280 72% 55%)"
];
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
                { s.change } {s.growth && "% From last month"}
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input placeholder="Search orders..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
                <div className="relative inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen((v) => !v)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
  {open && (
    <div className="absolute mt-2 w-40 bg-white border rounded-xl shadow-lg z-50">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          onClick={() => {
            setFilter(status === "all" ? "" :status);
            setOpen(false);
          }}
          className="w-full text-left px-3 py-2 hover:bg-gray-100"
        >
          {status}
        </button>
      ))}
    </div>
  )}</div>
            </div>
            <Button  onClick={()=> setopenOrderModal(true)}
  className="px-4 py-2 bg-green-600 text-white rounded-lg">
  {loadingImport ? "Importing..." : "Import Excel"}<Download className="w-4 h-4 mr-2" />
            </Button>
            <Button  onClick={()=> setopenOrderForm(true)}
  className="px-4 py-2 bg-green-600 text-white rounded-lg">
  <Plus className="w-4 h-4" />Add Order
            </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-visible">
             <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className=" p-4 font-medium text-muted-foreground">Order</th>
                  <th className=" p-4 font-medium text-muted-foreground">Customer</th>
                  <th className=" p-4 font-medium text-muted-foreground">Created At</th>
                  <th className=" p-4 font-medium text-muted-foreground">Product</th>
                  <th className=" p-4 font-medium text-muted-foreground">Amount</th>
                  <th className=" p-4 font-medium text-muted-foreground">Status</th>
                  <th className=" p-4 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
              
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">#{o.orderNumber}</td>
                    <td className="p-4">{o.customerName}</td>
                    <td className="p-4 text-muted-foreground">{o.createdAt.split("T")[0]}</td>
                    <td className="p-4"
                  title={(o.products || []).map((p) =>`${p.name} ×${p.quantity || 1}`).join(", ")}
                    >{(o.products || []).slice(0, 1).map((p) => (<span key={p.name}>
                     {p.name}
                     {p.quantity > 1 && `×${p.quantity}`}
                      </span>) )} 
                      {(o.products || []).length > 1 && (
                      <span className="more">
                      {"  "}+{(o.products || []).length - 1} more
                    </span>
                        )}</td>
                    <td className="p-4">${o.totalPrice}</td>
                    <td className="p-4">
                     {o.status === "pending" ?( <StatusPopover
                        disabled={o.status !== "pending"}
                        currentStatus={o.status}
                        onSelect={async (newStatus) => {
                          try {
                            await axios.patch(`${API_URL}/api/orders/${id}/${o._id}/status`,
                              { status: newStatus },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setSuccessMessage("Status updated successfuly");
                            setSuccessOpen(true);
                            queryClient.invalidateQueries(["orderslist", id]);
                            queryClient.invalidateQueries(["orders", id]);
                          } catch (err) {
                            setErrorMessage(err.response?.data.message);
                            setErrorOpen(true);
                            console.error("Failed to update status", err);
                          }
                        }}
                      />):(<span
      className={`px-2 py-1 rounded-full text-xs font-medium ${ o.status === "completed"
          ? "bg-success/10 text-success"
          : "bg-warning/10 text-warning" }`} >{o.status}</span>)}
                    </td>
                    <td>
    {o.status != "completed" && <button aria-label="Delete order"
      onClick={() => setDeleteTarget(o._id)}
     className=" text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors">
    <Trash2 size={15}/></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
    <p className="text-sm text-muted-foreground">
      Showing {start}–{end} of {totalorders} orders
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
    <AddOrderPopup2
    open={openOrderForm}
    setOpen={setopenOrderForm}
    />     
    <ImportOrdersModal
     open={openOrderModal} 
     onClose={()=> setopenOrderModal(false)}
     onUpload={handleFileChange} />
         <DeleteDialog 
      open={deleteTarget !== null}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteTarget(null)}
      Page = "The Order"
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
            setOpen(false);
            }}
          />
      </div>

  );
}