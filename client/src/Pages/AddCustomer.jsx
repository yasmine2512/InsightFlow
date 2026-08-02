import { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import { useAuth } from "../context/AuthContext";
import { Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddCustomerPopup({ open, setOpen, mode, initialData }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = user?.token;
  const id = user?.userId;

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
  };

  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen, setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");

  const isValidEmail = (email) => {
    return email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });
    }
    if (mode === "create") {
      setForm(emptyForm);
    }
    setError("");
  }, [mode, initialData]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const cleanedForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address,
      };

    const requiredFields = [
    ["name", "Name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["address", "Address"],
  ];

  for (const [field, label] of requiredFields) {
    if (!cleanedForm[field]) {
      setErrorMessage(`${label} is required.`);
      setErrorOpen(true);
      return;
    }
  }

    if (!isValidEmail(cleanedForm.email)) {
      setErrorMessage("Please enter a valid email address.");
      setErrorOpen(true);
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/customers/${id}`,
        cleanedForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("The Client has been created and saved successfully.");
      setSuccessOpen(true);
      queryClient.invalidateQueries(["customerslist", id]);
      queryClient.invalidateQueries(["customer", id]);
      setForm({ name: "", email: "", phone: "", address: "" });
    } catch (error) {
      setErrorMessage(error.response?.data?.message);
      setErrorOpen(true);
    }
  };

  const handleUpdate = async () => {
    const cleanedForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address,
      };

    const requiredFields = [
    ["name", "Name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["address", "Address"],
  ];

  for (const [field, label] of requiredFields) {
    if (!cleanedForm[field]) {
      setErrorMessage(`${label} is required.`);
      setErrorOpen(true);
      return;
    }
  }

    if (!isValidEmail(cleanedForm.email)) {
      setErrorMessage("Please enter a valid email address.");
      setErrorOpen(true);
      return;
    }
    try {
      const cleanedForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address,
      };
      const res = await axios.put(
        `${API_URL}/api/customers/${id}/${initialData._id}`,
        cleanedForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("The Client has been updated successfully.");
      setSuccessOpen(true);
      queryClient.invalidateQueries(["customerslist", id]);
      setForm({ name: "", email: "", phone: "", address: "" });
    } catch (error) {
      console.log(error.response);
      const msg = error.response?.data?.message;
      setErrorMessage(msg);
      setErrorOpen(true);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" 
     aria-labelledby="customer-dialog-title"
     className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[750px] max-h-[92vh] rounded-2xl overflow-y-auto shadow-xl p-6 flex flex-col border border-border">
        
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
            <Users size={20} className="text-primary" />
          </div>
          <div className="flex flex-col items-start text-left justify-center">
            <h2  id="customer-dialog-title" className="text-xl font-semibold leading-tight">
              {mode === "create" ? "Add Customer" : "Edit Customer"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the contact and profile information for this customer.</p>
          </div>
        </div>

        {error === "email" && (
          <span className="text-red-500 text-sm mb-4">
            Email already exists
          </span>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="flex flex-col">
            <label htmlFor="customer-name" className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Name
            </label>
            <input
              id="customer-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Customer name"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="customer-email" className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Customer email"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label htmlFor="customer-phone" className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Phone
            </label>
            <input
              id="customer-phone"
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Customer phone"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label htmlFor="customer-address" className="text-xs font-medium text-muted-foreground mb-1 ml-1">
              Address
            </label>
            <input
              id="customer-address"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Customer address"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
            />
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
          
          {mode === "create" ? (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Add Customer
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Update Customer
            </button>
          )}
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