import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";

const API_URL = import.meta.env.VITE_API_URL;


export default function AddOrderPopup({
  open,
  setOpen,
  onSave,
  productId,
  productPrice,
}) {
  const queryClient = useQueryClient();
  const {user} = useAuth();
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
  const [errorOpen,setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen,setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const isValidEmail = (email) => {
    return email === "" ||
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        {headers: { Authorization: `Bearer ${token}`,},}
      );
      queryClient.invalidateQueries(["orderslist", id]);
      queryClient.invalidateQueries(["orders", id]);
      setSuccessMessage("The Order has been created and saved successfully.");
      setSuccessOpen(true);
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.log(error.response.data);
      setErrorMessage(error.response?.data.message);
      setErrorOpen(true);
    }
  };
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] max-h-[92vh] rounded-2xl overflow-y-auto shadow-xl p-6 flex flex-col border">
    
        <h2 className="text-2xl font-semibold mb-6">
          Create Order
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Name */}
          <div className="flex flex-col">
            <label className="mb-2 ml-1">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Customer name"
              className="border p-3 rounded-lg"
            />
          </div>
          {/* Customer Email */}
          <div className="flex flex-col">
            <label className="mb-2 ml-1">
              Customer Email
            </label>
            <input
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="Customer email"
              className="border p-3 rounded-lg"
            />
          </div>
          {/* Customer Phone */}
          <div className="flex flex-col">
            <label className="mb-2 ml-1">
              Customer Phone
            </label>
            <input
              type="text"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="Customer phone"
              className="border p-3 rounded-lg"
            />
          </div>
          {/* Quantity */}
          <div className="flex flex-col">
            <label className="mb-2 ml-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border p-3 rounded-lg"
            />
          </div>
          {/* Address */}
          <div className="flex flex-col col-span-2">
            <label className="mb-2 ml-1">
              Customer Address
            </label>
            <textarea
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleChange}
              placeholder="Customer address"
              rows={1}
              className="border p-3 rounded-lg"
            />
          </div>

          {/* Total */}
          <div className="col-span-2">
            <div className="border rounded-xl p-4 bg-gray-50">
              <p className="text-lg font-semibold">
                Total Price :{" "}
                {(
                  Number(form.quantity || 0) * productPrice
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-black text-white rounded-lg"
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