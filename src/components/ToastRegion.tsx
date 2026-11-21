import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import { useCreatorVerse } from "../context/CreatorVerseContext";

export function ToastRegion() {
  const { toasts, dismissToast } = useCreatorVerse();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.tone === "error"
            ? AlertCircle
            : toast.tone === "info"
            ? Info
            : CheckCircle2;
        const iconColor =
          toast.tone === "error"
            ? "text-rose-400"
            : toast.tone === "info"
            ? "text-blue-400"
            : "text-emerald-400";

        return (
          <div
            key={toast.id}
            className="cv-glass flex items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-2xl border border-white/12"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
              <p className="text-xs sm:text-sm font-medium text-zinc-100">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
