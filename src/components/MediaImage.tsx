import { useState } from "react";
import { User, Sparkles } from "lucide-react";

interface MediaImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  variant?: "avatar" | "media";
}

export function MediaImage({
  src,
  alt,
  className = "",
  fallbackLabel,
  variant = "media",
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const initials = (fallbackLabel || alt || "CV")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");

    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-violet-950/80 via-[#151624] to-blue-950/70 text-violet-200 select-none ${className}`}
      >
        {variant === "avatar" ? (
          <span className="font-display font-semibold tracking-tight text-sm">
            {initials || <User className="w-4 h-4" />}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
            {fallbackLabel && (
              <span className="text-xs font-medium text-zinc-300">{fallbackLabel}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
