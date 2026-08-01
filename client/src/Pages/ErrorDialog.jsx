import { AlertCircle } from "lucide-react";

export function ErrorDialog({ open, onClose, title = "Error", message, actionLabel = "Try Again" }) {
  if (!open) return null;

  return (
    <div role="dialog" 
     aria-labelledby="error-dialog-title"
    className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <h2 id="error-dialog-title" className="text-base font-semibold text-center mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {message || "An unexpected error occurred while processing your request. Please try again."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}