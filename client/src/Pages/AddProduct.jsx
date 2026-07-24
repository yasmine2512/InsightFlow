import { useState ,useEffect} from "react"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { ErrorDialog } from "./ErrorDialog";
import { SuccessDialog } from "./SuccesDialog";
const API_URL = import.meta.env.VITE_API_URL;

export default function AddProductPopup({ open, setOpen, onSave, mode, initialData }) {
  const queryClient = useQueryClient();
  const {user} = useAuth();
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
  sku:"",
  });
  const [errorOpen,setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succesOpen,setSuccessOpen] = useState(false);
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
      sku:initialData.sku || "",
    });
  }
}, [initialData]);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async() => {
    const product = {
      ...form,
      features: form.features.split("\n"),
    }
    const data = new FormData()

    data.append("name", product.name)
    data.append("price", product.price)
    data.append("category", product.category)
    data.append("stock",product.stock)
    data.append("desc", product.description)
    data.append("features", JSON.stringify(product.features))
    data.append("image", form.image)
    data.append("sku", product.sku)
try{
    await axios.post(`${API_URL}/api/products/${id}/new-product`, data,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  setSuccessMessage("The Product has been created and saved successfully.");
  setSuccessOpen(true);
    queryClient.invalidateQueries(["productsStats", id]);
    queryClient.invalidateQueries(["productlist", id]);
}catch(error){
    console.log(error.message);
    setErrorMessage(error.message);
    setErrorOpen(true);
}
  }
 const handleUpdate = async() => {
    const product = {
      ...form,
      features: form.features.split("\n"),
    }
    const data = new FormData()

    data.append("name", product.name)
    data.append("price", product.price)
    data.append("category", product.category)
    data.append("stock",product.stock)
    data.append("desc", product.description)
    data.append("features", JSON.stringify(product.features))
    if (form.image instanceof File) {
    data.append("image", form.image)}
    data.append("sku", product.sku)
try{
    await axios.put(`${API_URL}/api/products/${id}/product/${initialData._id}`, data,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  setSuccessMessage("The Product has been updated successfully.");
  setSuccessOpen(true);
  queryClient.invalidateQueries(["productsStats", id]);
  queryClient.invalidateQueries(["productlist", id]);
}catch(error){
    console.log(error.response?.data || error.message);
    setErrorMessage(error.message);
    setErrorOpen(true);
}
  }
  if (!open) return null

  return (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div className="bg-white w-[700px] h-[92vh] rounded-2xl overflow-y-auto shadow-xl p-6 flex flex-col border">

    <h2 className="text-xl font-semibold mb-5 ">
       {mode === "create"
    ? "Add Product"
    : "Edit Product"}
    </h2>

    <div className="grid grid-cols-2 gap-2">

      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left  ml-3">Product Name</label>
        <input
          name="name"
          value={form?.name}
          placeholder="Product name"
          className="border p-2 rounded-lg w-full "
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left ml-3">Price</label>
        <input
          value={form?.price}
          name="price"
          placeholder="Price (ex: $49/mo)"
          className="border p-2 rounded-lg w-full"
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left ml-3">Category</label>
        <input
          value={form?.category}
          name="category"
          placeholder="Category"
          className="border p-2 rounded-lg w-dull"
          onChange={handleChange}
        />
      </div>


      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left ml-3">Stock</label>
        <input
          value={form?.stock}
          name="stock"
          placeholder="Stock"
          className="border p-2 rounded-lg w-full"
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left ml-3">Description</label>
        <textarea
          value={form?.description}
          name="description"
          placeholder="Description"
          className="border p-2 rounded-lg w-full"
          rows={3}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left ml-3">Features</label>
        <textarea
          value={form?.features}
          name="features"
          placeholder="Features (one per line)"
          className="border p-2 rounded-lg w-full"
          rows={3}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col col-span-2 mx-1">
        <label className="mb-2 text-left ml-3">Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
          className="border p-2 rounded-lg"
        />
      </div>

      <div className="flex flex-col mx-1">
        <label className="mb-2 text-left ml-3">Sku</label>
        <input
          value={form?.sku}
          name="sku"
          placeholder="Product Sku"
          className="border p-2 rounded-lg w-full"
          onChange={handleChange}
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

       {mode === "create"
    ? (<button
        onClick={handleSubmit}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        Add Product
      </button>):(<button
        onClick={handleUpdate}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        Update Product
      </button>)}

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
  )
}