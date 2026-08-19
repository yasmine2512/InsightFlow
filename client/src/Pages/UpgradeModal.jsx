import { Sparkles, Check, ArrowRight, X } from "lucide-react";

export function UpgradeModal({ isOpen, onClose, featureName, description }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-xl p-6 text-card-foreground">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <h2 className="text-xl font-bold">
            Unlock {featureName || "Pro Features"}
          </h2>
          
          <p className="text-muted-foreground text-sm">
            {description || "Take your business to the next level with advanced tools designed to help you scale faster."}
          </p>
        </div>

        {/* Feature Highlights Box */}
        <div className="bg-muted/50 rounded-xl p-4 my-4 space-y-2.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-primary font-bold">Pro Plan includes:</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>AI Assistant (10 messages/day)</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Knowledge Base File Uploads (up to 10 files)</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Excel Imports for Products, Orders & Customers</span>
          </div>
        </div>

        {/* Pricing Anchor */}
        <div className="text-center mb-5">
          <span className="text-2xl font-bold">$9.99</span>
          <span className="text-muted-foreground text-sm"> / month · Cancel anytime</span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <a 
            href="/subscriptions" 
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Upgrade to Pro <ArrowRight className="w-4 h-4" />
          </a>
          
          <button 
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-lg text-muted-foreground hover:bg-muted font-medium text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>

      </div>
    </div>
  );
}