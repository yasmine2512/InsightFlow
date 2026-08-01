import { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
import { Package } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddProductPopup({ open, setOpen, onSave, mode, initialData }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = user?.token;
  const id = user?.userId;

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: 0,
    description: "",
    features: "",
    image: null,
    sku: "",
  });
  
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen, setSuccessOpen] = useState(false);
  const [successMessgae, setSuccessMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        price: initialData.price || "",
        category: initialData.category || "",
        stock: initialData.stock || 0,
        description: initialData.description || "",
        features: initialData.features?.join("\n") || "",
        image: initialData.image || null,
        sku: initialData.sku || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();
    const description = form.description.trim();

    const price = Number(form.price);
    const stock = Number(form.stock);

    const features = form.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (!name) {
      setErrorMessage("Product name is required.");
      setErrorOpen(true);
      return;
    }

    if (!sku) {
      setErrorMessage("SKU is required.");
      setErrorOpen(true);
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setErrorMessage("Please enter a valid price.");
      setErrorOpen(true);
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setErrorMessage("Please enter a valid stock quantity.");
      setErrorOpen(true);
      return;
    }

    const data = new FormData();
    data.append("name", name);
    data.append("price", price);
    data.append("stock", stock);
    data.append("sku", sku);

    if (category) {
      data.append("category", category);
    }

    if (description) {
      data.append("desc", description);
    }

    if (features.length > 0) {
      data.append("features", JSON.stringify(features));
    }

    if (form.image instanceof File) {
      data.append("image", form.image);
    }

    try {
      await axios.post(`${API_URL}/api/products/${id}/new-product`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("The Product has been created and saved successfully.");
      setSuccessOpen(true);
      queryClient.invalidateQueries(["productsStats", id]);
      queryClient.invalidateQueries(["productlist", id]);
    } catch (error) {
      console.log(error.response);
      setErrorMessage(error.response?.data?.message);
      setErrorOpen(true);
    }
  };

  const handleUpdate = async () => {
    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();
    const description = form.description.trim();

    const price = Number(form.price);
    const stock = Number(form.stock);

    const features = form.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (!name) {
      setErrorMessage("Product name is required.");
      setErrorOpen(true);
      return;
    }

    if (!sku) {
      setErrorMessage("SKU is required.");
      setErrorOpen(true);
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setErrorMessage("Please enter a valid price.");
      setErrorOpen(true);
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setErrorMessage("Please enter a valid stock quantity.");
      setErrorOpen(true);
      return;
    }

    const data = new FormData();
    data.append("name", name);
    data.append("price", price);
    data.append("stock", stock);
    data.append("sku", sku);

    if (category) {
      data.append("category", category);
    }

    if (description) {
      data.append("desc", description);
    }

    if (features.length > 0) {
      data.append("features", JSON.stringify(features));
    }

    if (form.image instanceof File) {
      data.append("image", form.image);
    }
    
    try {
      await axios.put(`${API_URL}/api/products/${id}/product/${initialData._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (onSave) {
        await onSave();
      }
      setSuccessMessage("The Product has been updated successfully.");
      setSuccessOpen(true);
      queryClient.invalidateQueries(["productsStats", id]);
      queryClient.invalidateQueries(["productlist", id]);
    } catch (error) {
      console.log(error.response?.data);
      setErrorMessage(error.response?.data.message);
      setErrorOpen(true);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[750px] max-h-[92vh] rounded-2xl overflow-y-auto shadow-xl p-6 flex flex-col border border-border">

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Package size={20} className="text-primary" />
          </div>
          <div className="flex flex-col items-start text-left justify-center">
            <h2 className="text-xl font-semibold">
              {mode === "create" ? "Add Product" : "Edit Product"}
            </h2>
            <p className="text-xs text-muted-foreground">Fill in the specifications and inventory data for this product.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Product Name */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Product Name</label>
            <input
              name="name"
              value={form?.name}
              placeholder="Product name"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              onChange={handleChange}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Price</label>
            <input
              value={form?.price}
              name="price"
              placeholder="Price (ex: $49/mo)"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Category</label>
            <input
              value={form?.category}
              name="category"
              placeholder="Category"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              onChange={handleChange}
            />
          </div>

          {/* Stock */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Stock</label>
            <input
              value={form?.stock}
              name="stock"
              type="number"
              placeholder="Stock"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              onChange={handleChange}
            />
          </div>

          {/* Sku */}
          <div className="flex flex-col col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Sku</label>
            <input
              value={form?.sku}
              name="sku"
              placeholder="Product Sku"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Description</label>
            <textarea
              value={form?.description}
              name="description"
              placeholder="Description"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              rows={2}
              onChange={handleChange}
            />
          </div>

          {/* Features */}
          <div className="flex flex-col col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Features</label>
            <textarea
              value={form?.features}
              name="features"
              placeholder="Features (one per line)"
              className="border border-border p-3 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              rows={2}
              onChange={handleChange}
            />
          </div>

          {/* Image */}
          <div className="flex flex-col col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 ml-1">Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files[0] })
              }
              className="border border-border p-3 rounded-xl text-sm bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
              Add Product
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Update Product
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