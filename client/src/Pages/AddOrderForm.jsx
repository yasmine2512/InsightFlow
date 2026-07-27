import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

export function AddOrderForm({ onSubmitOrder }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const productsList = ["prod1","prod2"];
  // State for multiple products inside this order
  const [items, setItems] = useState([
    { sku: "", quantity: 1 }
  ]);

  // Add a new empty product row
  const handleAddItem = () => {
    setItems([...items, { sku: "", quantity: 1 }]);
  };

  // Remove a product row
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Update specific product row data
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      customerName,
      customerEmail,
      items
    };
    onSubmitOrder(orderData);
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <ShoppingCart size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Create New Order</h2>
          <p className="text-sm text-muted-foreground">Add customer details and order items.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <hr className="border-border my-4" />

        {/* Product Items Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Items</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                    value={item.sku}
                    onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                    required
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                    <option value="" disabled>Select a product...</option>
                    {productsList.map((product) => (
                    <option key={product.sku} value={product.sku}>
                        {product.name} ({product.sku}) - ${product.price}
                    </option>
                    ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                  required
                  className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Create Order
        </button>
      </form>
    </div>
  );
}