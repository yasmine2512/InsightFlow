import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import { ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddOrderPopup({
  open,
  setOpen,
  onSave,
  productId,
  productPrice,
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = user?.token;
  const id = user?.userId;
  
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    quantity: 1,
    status: "pending",
  });
  
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen, setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isValidEmail = (email) => {
    return email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!isValidEmail(form.customerEmail)) {
      setErrorMessage("Please enter a valid email address.");
      setErrorOpen(true);
      return;
    }
    try {
      const totalPrice = Number(form.quantity) * productPrice;
      const body = {
        customer: {
          name: form.customerName,
          email: form.customerEmail,
          phone: form.customerPhone,
          address: form.customerAddress,
        },
        products: [
          {
            product: productId,
            quantity: Number(form.quantity),
            priceAtPurchase: productPrice,
          },
        ],
        totalPrice,
      };
      const res = await axios.post(
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
      setErrorMessage(error.response?.data.message);
      setErrorOpen(true);
    }
  };
  
  if (!open) return null;

  return (
    <div role="dialog" 
     aria-labelledby="order-dialog-title"
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[750px] max-h-[92vh] rounded-2xl overflow-y-auto shadow-xl p-6 flex flex-col border border-border">
        
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <ShoppingCart size={20} className="text-primary" />
          </div>
          <div className="flex flex-col items-start text-left justify-center">
            <h2 id="order-dialog-title" className="text-xl font-semibold">Create Order</h2>
            <p className="text-xs text-muted-foreground">Fill in customer details and order quantity.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Customer Name */}
          <div className="flex flex-col">
            <label htmlFor="customer-name"
             className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Customer Name
            </label>
            <input
              id="customer-name"
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
            <label htmlFor="customer-email" 
            className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Customer Email
            </label>
            <input
              id="customer-email"
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="Customer email"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Customer Phone */}
          <div 
          className="flex flex-col">
            <label htmlFor="customer-phone" className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Customer Phone
            </label>
            <input
              id="customer-phone"
              type="text"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="Customer phone"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col">
            <label htmlFor="product-quantity" className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Quantity
            </label>
            <input
              id="product-quantity"
              type="number"
              min="1"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col col-span-2">
            <label htmlFor="customer-address"
            className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Customer Address
            </label>
            <textarea
              id="customer-address"
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleChange}
              placeholder="Customer address"
              rows={1}
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Total */}
          <div className="col-span-2 mt-2">
            <div className="border border-border rounded-xl p-4 bg-muted/50 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
              <span className="text-lg font-bold text-foreground">
                ${(Number(form.quantity || 0) * productPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
        message={successMessgae}
        onClose={() => {
          setSuccessOpen(false);
          setOpen(false);
        }}
      />     
    </div>
  );
}