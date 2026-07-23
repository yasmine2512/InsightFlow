import { useState ,useEffect} from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import { useAuth } from "../context/AuthContext";
import { SuccessDialog } from "./SuccesDialog";

const API_URL = import.meta.env.VITE_API_URL;
export default function AddCustomerPopup({open,setOpen,mode, initialData}) {
const queryClient = useQueryClient();
const {user} = useAuth();
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
  const [errorOpen,setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen,setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");
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
}, [mode,initialData]);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async () => {
    try {
        const cleanedForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address,
        };
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
      setOpen(false);
      queryClient.invalidateQueries(["customerslist", id]);

      setForm({name: "",email: "",phone: "",address: "",});
    } catch (error) {
      console.log(error);
      setErrorMessage(error.message);
      setErrorOpen(true);
    }
  };

const handleUpdate = async () => {
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
      setSuccessMessage("The Client has been updated successfully.")
      setSuccessOpen(true);
      setOpen(false);
      queryClient.invalidateQueries(["customerslist", id]);
      setForm({name: "",email: "",phone: "",address: "",});
    } catch (error) {
        const msg = error.response?.data?.message;
        setErrorMessage(msg);
        setErrorOpen(true);
  };
}
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[650px] rounded-2xl shadow-xl p-6 border">

        {mode === "create"?(<h2 className="text-2xl font-semibold mb-6">
          Add Customer
        </h2>):(
            <h2 className="text-2xl font-semibold mb-6">
          Edit Customer
        </h2>

        )}
{error === "email" && (
                <span className="text-red-500 text-sm mt-1">
                    Email already exists
                </span>)}
        <div className="grid grid-cols-2 gap-4">

          {/* Name */}
          <div className="flex flex-col">
            <label className="mb-2">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Customer name"
              className="border p-3 rounded-lg"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Customer email"
              className="border p-3 rounded-lg"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-2">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Customer phone"
              className="border p-3 rounded-lg"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="mb-2">
              Address
            </label>

            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Customer address"
              className="border p-3 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
            { mode === "create"?(
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Add Customer
          </button>):(
                <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-black text-white rounded-lg"
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
              message= {successMessgae}
              onClose={() => setSuccessOpen(false)}
            />      
    </div>
  );
}