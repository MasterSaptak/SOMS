import { FolderOpen } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px] border border-dashed rounded-lg bg-muted/20">
      <div className="bg-muted p-4 rounded-full mb-4 text-muted-foreground">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}
