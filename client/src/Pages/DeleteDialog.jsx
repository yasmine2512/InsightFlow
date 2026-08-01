import {Trash2} from "lucide-react";
export function DeleteDialog({ open, onConfirm, onCancel ,Page }) {
  if (!open) return null;
  return (
    <div role="dialog"
     aria-labelledby="delete-dialog-title"
    className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4">
          <Trash2 size={22} className="text-destructive" />
        </div>
        <h2 id="delete-dialog-title" className="text-base font-semibold text-center mb-1">Delete {Page}</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          This action cannot be undone. {Page} will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          > Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}