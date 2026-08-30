import { Search, Filter, Download ,Package,ShoppingCart,DollarSign,TrendingDown,TrendingUp,CheckCircle2,Trash2,Plus,ChevronDown} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useEffect, useState, useRef} from "react"
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip,BarChart ,CartesianGrid,XAxis, YAxis,Bar} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteDialog } from "./DeleteDialog";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import AddOrderPopup2 from "./AddOrderPopup";
import { ImportOrdersModal } from "./ImportOrderModal";
import { UpgradeModal } from "./UpgradeModal";
import { useAuth } from "../context/AuthContext";
const fillMissingDays = (data) => {
const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDate = date.toISOString().split("T")[0];
    const existing = data.find(
      (item) => item.date === formattedDate
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

const fillMissingMonths = (data) => {
  const now = new Date();
  const result = [];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dateKey = `${year}-${month}`;

    const existing = data.find(
      (item) => item.date === dateKey
    );
    result.push({
      name: monthNames[date.getMonth()],
      value: existing ? existing.orders : 0,
    });
  }
  return result;
};

const STATUS_OPTIONS = ["pending", "canceled", "completed"];

function StatusPopover({ currentStatus, onSelect }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate position on open so it floats above everything
  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const styles = {
    completed: "bg-success/10 text-success",
    pending: "bg-primary/10 text-primary",
    canceled: "bg-warning/10 text-warning",
  };

  return (
    <>
      <div className="inline-block" ref={buttonRef}>
        <button onClick={handleToggle} type="button">
          <span className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${styles[currentStatus]}`}>
            {currentStatus}
          </span>
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ top: coords.top, left: coords.left }}
            className="absolute z-[9999] w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Change status</p>
            {STATUS_OPTIONS.filter((s) => s !== currentStatus).map((s) => (
              <button
                key={s}
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    s === "completed" ? "bg-success" : s === "pending" ? "bg-primary" : "bg-warning"
                  }`}
                />
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

export default function Orders() {
  const { user} = useAuth();
  const id = user?.userId;
  const plan = user.plan;
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorOpen,setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen,setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");
  const [openOrderModal,setopenOrderModal] = useState(false);
  const [openOrderForm,setopenOrderForm] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [chartFilter, setChartFilter] = useState("Month");
  const tableTopRef = useRef(null);

  const handleDeleteConfirm = async () => {
  try {
    await api.delete(`/api/orders/${id}/${deleteTarget}`);
    queryClient.invalidateQueries(["orderslist", id]);
    queryClient.invalidateQueries(["orders", id]);
    setDeleteTarget(null);
    setSuccessMessage("Order deleted successfully");
    setSuccessOpen(true);
  } catch (err) {
    setDeleteTarget(null);
    setErrorTitle("Delete Error");
    setErrorMessage(err.response.data.message);
    setErrorOpen(true);
  }
  }

  const fetchStats= async () => {
      try {
        const res = await api.get(`/api/orders/${id}/stats`);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
const fetchOrders= async ({page,search,status}) => {
      try {
        const res = await api.get(`/api/orders/${id}`,
           {params: { page,limit: 10,search,status}});
        setTimeout(() => {
          tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
        return res.data;
      } catch (err) {
        console.error("Unauthorized or token invalid", err)
        throw err;
      }
    }
const handleImport =()=>{
  if(!plan || plan === "free"){
    setShowUpgradeModal(true);
  }else{
    setopenOrderModal(true);
  }
}

const fetchOrdersChart = async (filterValue) => {
  const response = await api.get(`/api/orders/${id}/chart`, {
    params: { period: filterValue },
  });
  return filterValue === "Week"
    ? fillMissingDays(response.data)
    : fillMissingMonths(response.data);
};

  const handleChartFilterChange = (e) => {
     setChartFilter(e.target.value);
  };

const [loadingImport, setLoadingImport] = useState(false);
const handleFileChange = async (file) => {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  try {
    setLoadingImport(true);
    const res = await api.post(`/api/orders/import/${id}`,formData);
    
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
    setErrorTitle("Create Error");
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
  }, 700);
  return () => clearTimeout(timer);
}, [search]);
useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch]);
const { data:data,isLoading: isLoadingstats,error: errorstats } = useQuery({ queryKey: ["orders", id], queryFn: fetchStats, staleTime: 1000 * 60 * 5 });
const {data: ordersChart = [],isLoading: isLoadingChart,error: errorChart} = useQuery({
  queryKey: ["ordersChart", id, chartFilter],
  queryFn: () => fetchOrdersChart(chartFilter),
  staleTime: 1000 * 60 * 5,
});
const [currentPage, setCurrentPage] = useState(1);

const {  data: orderslist, isLoading, error } = useQuery({
   queryKey: ["orderslist", id,currentPage,debouncedSearch,filter],
   queryFn: () => fetchOrders({page:currentPage,search:debouncedSearch,status:filter}),keepPreviousData: true,staleTime: 1000 * 60 * 5});
  if (isLoading  || isLoadingstats || !data) return <div>Loading...</div>
  if (error || errorstats || errorChart) return <p>Error loading orders</p>;
const OG = data.ordersgrowth.toFixed(1) || 0;
const AOV = data.averageordervalue.toFixed(1) || 0;
const AOVG = data.averageordervalue.toFixed(1) || 0;
const FR= data.fulfillmentrate.toFixed(1) || 0;
const FRG=data.FRgrowth.toFixed(1) || 0;
const ordersData = data.ordersbystatus || [];
const orders = orderslist.orders.orders || [];
const pendingOrders = data.pendingOrders || 0;
  const rowsPerPage = 10;
  const totalorders = orderslist.orders.total;
  const totalPages = Math.max(1,Math.ceil(totalorders / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage + 1;
const end = Math.min(currentPage * rowsPerPage,totalorders);
   const stats = [
  { label: "Orders This Month", value: data.ordersTM,change:OG,growth:true, up:OG>= 0, icon: Package },
  { label: "Pending Orders", value:pendingOrders,growth:false, icon: ShoppingCart },
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
      <h1 className="font-heading text-2xl font-bold">Orders</h1>
      <p className="text-sm text-muted-foreground">Track and manage all orders</p>
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
          {s.growth ? (s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />) : (<div />)}
          {s.change} {s.growth && "% From last month"}
        </div>
      </div>
    ))}
  </div>

  <div className="grid lg:grid-cols-2 gap-6">
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft flex flex-col">
      <h3 className="font-heading font-semibold">Monthly Orders Distribution</h3>
      <div className="w-full h-[220px] flex items-center justify-center relative">
        {ordersData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground text-center">
            No orders this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ordersData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" paddingAngle={3} nameKey="_id">
                {ordersData.map((entry, i) => <Cell key={i} fill={colors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {ordersData.map((p, i) => (
          <div key={p._id} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
            {p._id}
          </div>
        ))}
      </div>
    </div>

    <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
  <div className="relative flex items-center justify-center mb-4">
    <h3 className="font-heading font-semibold">Orders {chartFilter === "Week" ? "This Week":"Last Months" }</h3>
    <div className="absolute right-0">
      <div className="relative">
        <select
          value={chartFilter}
          onChange={handleChartFilterChange}
          aria-label="Filter Orders Chart"
          className="appearance-none bg-background/95 hover:bg-muted/40 border border-border/80 rounded-xl w-9 h-9 px-2 text-transparent focus:text-foreground focus:w-28 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-xs text-xs font-medium"
        >
          <option value="Week" className="bg-card text-foreground py-2 font-medium">This Week</option>
          <option value="Month" className="bg-card text-foreground py-2 font-medium">Last Months</option>
        </select>
        <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform duration-200" />
      </div>
    </div>
  </div>
  <div className="relative">
    {isLoadingChart && (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-10 rounded-lg">
        <span className="text-xs font-medium animate-pulse text-green-500">
          Loading Chart...
        </span>
      </div>
    )}

  <ResponsiveContainer width="100%" height={240}>
    <BarChart data={ordersChart}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
      <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="value" fill="hsl(172 66% 50%)" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
  </div>
</div>
  </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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
    <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-40 bg-white border rounded-xl shadow-lg z-50">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button  onClick={handleImport}
  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2">
  <Download className="w-4 h-4 mr-2" />{loadingImport ? "Importing..." : "Import Excel"}
            </Button>
            <Button  onClick={()=> setopenOrderForm(true)}
  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2">
  <Plus className="w-4 h-4" />Add Order
            </Button>
            </div>
        </div>

        <div ref={tableTopRef} 
        className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="w-full overflow-x-auto">
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
                            await api.patch(`/api/orders/${id}/${o._id}/status`,
                              { status: newStatus }
                            );
                            setSuccessMessage("Status updated successfuly");
                            setSuccessOpen(true);
                            queryClient.invalidateQueries(["orderslist", id]);
                            queryClient.invalidateQueries(["orders", id]);
                          } catch (err) {
                            setErrorMessage(err.response?.data.message);
                            setErrorOpen(true);
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
          title={errorTitle}
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
    <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            featureName="Excel Import"
            description="Unlock seamless bulk importing for products, orders, and customers by upgrading to Pro."
          />
      </div>

  );
}