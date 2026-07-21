import { CheckCircle2 } from "lucide-react";

export function SuccessDialog({ open, onClose, title = "Success!", message, actionLabel = "Continue" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mx-auto mb-4">
          <CheckCircle2 size={22} className="text-emerald-500" />
        </div>
        <h2 className="text-base font-semibold text-center mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
           The {message} has been created and saved successfully.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}