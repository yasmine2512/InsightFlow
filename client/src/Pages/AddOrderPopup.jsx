import { useState,useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddOrderPopup2({
  open,
  setOpen,
  onSave, 
}) {
    if (!open) return null;
  const [productsList,setProductsList] = useState([]);
  const fetchProducts = async () => {
         try {
           const res = await axios.get(`${API_URL}/api/products/${id}/select`, {
             headers: { Authorization: `Bearer ${token}` }
           })
           console.log(res.data);

          return res.data;
         } catch (err) {
           console.error("Unauthorized or token invalid", err)
         }
       }

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = user?.token;
  const id = user?.userId;
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    status: "pending",
  });
  
  const [orderItems, setOrderItems] = useState([
    { product: "", quantity: 1, price: 0 }
  ]);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add new item row
  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: "", quantity: 1, price: 0 }]);
  };

  // Remove item row
  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Handle product selection or quantity change in a row
  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    
    if (field === "product") {
      const selectedProd = productsList.find((p) => p._id === value);
      newItems[index].product = value;
      newItems[index].price = selectedProd ? selectedProd.price : 0;
    } else if (field === "quantity") {
      newItems[index].quantity = Math.max(1, Number(value) || 1);
    }

    setOrderItems(newItems);
  };

  // Calculate dynamic total price across all items
  const totalPrice = orderItems.reduce((acc, item) => {
    return acc + (item.quantity * (item.price || 0));
  }, 0);

  const isValidEmail = (email) => {
    return email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!isValidEmail(form.customerEmail)) {
      setErrorMessage("Please enter a valid email address.");
      setErrorOpen(true);
      return;
    }

    if (orderItems.length === 0 || orderItems.some(item => !item.product)) {
      setErrorMessage("Please select at least one valid product for the order.");
      setErrorOpen(true);
      return;
    }

    try {
      const body = {
        customer: {
          name: form.customerName,
          email: form.customerEmail.toLowerCase().trim(),
          phone: form.customerPhone.trim(),
          address: form.customerAddress,
        },
        products: orderItems.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          priceAtPurchase: item.price,
        })),
        totalPrice,
      };

      await axios.post(
        `${API_URL}/api/orders/${id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      queryClient.invalidateQueries(["orderslist", id]);
      queryClient.invalidateQueries(["orders", id]);
      setSuccessMessage("The Order has been created and saved successfully.");
      setSuccessOpen(true);
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.log(error.response?.data);
      setErrorMessage(error.response?.data?.message || "Failed to create order.");
      setErrorOpen(true);
    }
  };

    useEffect(() => {
  const loadProducts = async () => {
    const products = await fetchProducts();
    setProductsList(products);
  };
  loadProducts();
}, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[750px] max-h-[92vh] rounded-2xl overflow-y-auto shadow-xl p-6 flex flex-col border border-border">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <ShoppingCart size={20} className="text-primary" />
          </div>
          <div className="flex flex-col items-start text-left justify-center">
            <h2 className="text-xl font-semibold">Create New Order</h2>
            <p className="text-xs text-muted-foreground">Fill in customer details and pick products.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Customer Name */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Customer name"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Customer Email */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Customer Email</label>
            <input
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="Customer email"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Customer Phone */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Customer Phone</label>
            <input
              type="text"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="Customer phone"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Customer Address</label>
            <input
              type="text"
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleChange}
              placeholder="Customer address"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Products Multi-Select Section */}
          <div className="col-span-2 mt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus size={14} /> Add Product Row
              </button>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select

                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    className="flex-1 block w-full px-3 py-3 text-sm bg-white text-black border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="" disabled>Select product SKU / name...</option>
                    {productsList.map((prod) => (
                      <option key={prod._id} value={prod._id} 
                      disabled={prod.stock <= item.quantity }>
                        {prod.name} ({prod.sku}) — ${prod.price}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    placeholder="Qty"
                    className="w-24 border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total Price Box */}
          <div className="col-span-2 mt-2">
            <div className="border border-border rounded-xl p-4 bg-muted/50 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
              <span className="text-lg font-bold text-foreground">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create Order
          </button>
        </div>
      </div>

      <ErrorDialog
        open={errorOpen}
        title="Create Error"
        message={errorMessage}
        actionLabel="Okay"
        onClose={() => setErrorOpen(false)}
      />
      
      <SuccessDialog
        open={succesOpen}
        message={successMessage}
        onClose={() => {
          setSuccessOpen(false);
          setOpen(false);
        }}
      />     
    </div>
  );
}