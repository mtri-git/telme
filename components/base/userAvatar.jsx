import { memo } from "react";
import { cn } from "@/lib/utils";
import { generateColorFromName, getInitials } from "@/utils/function";

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-10 w-10 text-sm",
};

function UserAvatar({ name, size = "md", className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: generateColorFromName(name || "?") }}
    >
      {getInitials(name)}
    </div>
  );
}

export default memo(UserAvatar);
