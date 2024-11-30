import { Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

export function Loading({ size = 'medium', message = 'Loading...', className }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )
}
