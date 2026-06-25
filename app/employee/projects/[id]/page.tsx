"use client"

import React, { use } from "react"
import { useRouter } from "next/navigation"
import { ProjectDetailPage } from "@/components/work/ProjectDetailPage"

export default function ProjectDetailsRoute({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <ProjectDetailPage 
        projectId={id} 
        onBack={() => router.push("/employee/projects")} 
      />
    </div>
  )
}
