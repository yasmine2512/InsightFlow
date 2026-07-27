import { useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import * as XLSX from "xlsx";

export function ImportProductsModal({ open, onClose, onUpload }) {
  if (!open) return null;

  const downloadProductTemplate = () => {
    // Generate sample data for products
    const sampleData = [
      { 
        "SKU": "PROD-001", 
        "Product Name": "Wireless Mouse", 
        "Price": 25.99, 
        "Stock": 120, 
        "Image URL": "https://example.com/mouse.jpg" 
      },
      { 
        "SKU": "PROD-002", 
        "Product Name": "Mechanical Keyboard", 
        "Price": 89.99, 
        "Stock": 45, 
        "Image URL": "https://example.com/keyboard.jpg" 
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    
    // Trigger download
    XLSX.writeFile(workbook, "product_import_template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Upload size={20} className="text-primary" />
            </div>
            <h2 className="text-base font-semibold">Import Products</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Instructions & Template Download Link */}
        <div className="mb-6 bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Before you upload:</p>
          <p className="mb-3 text-xs leading-relaxed">
            Ensure your spreadsheet includes unique SKUs, product names, valid prices, stock numbers, and optional image URLs.
          </p>
          <button
            type="button"
            onClick={downloadProductTemplate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <FileSpreadsheet size={16} />
            Download Sample Template (.xlsx)
          </button>
        </div>

        {/* File Input Upload Area */}
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => onUpload(e.target.files[0])}
            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {/* Footer actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}