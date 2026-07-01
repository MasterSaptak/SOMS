import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <div className="space-y-2 flex flex-col items-center">
        <h3 className="font-medium text-lg">Loading projects...</h3>
        <p className="text-sm text-muted-foreground">Preparing your data</p>
      </div>
    </div>
  )
}
