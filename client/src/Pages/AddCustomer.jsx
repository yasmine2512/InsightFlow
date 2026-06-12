import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
export default function AddCustomerPopup({
  open,
  setOpen,
  organizationId,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/customers/${organizationId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Customer added successfully");
      if (onSave) {
        onSave(res.data.customer);
      }

      setOpen(false);

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
      });

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to add customer"
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[650px] rounded-2xl shadow-xl p-6 border">

        <h2 className="text-2xl font-semibold mb-6">
          Add Customer
        </h2>

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

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}