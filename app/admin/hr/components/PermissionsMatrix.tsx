"use client"

import React from "react"
import { Shield, Check, X, Users, AlertCircle } from "lucide-react"

export default function PermissionsMatrix() {
  const roles = ["Admin", "HR Manager", "Department Head", "Employee", "Contractor"]
  const permissions = [
    { category: "People", items: ["View Directory", "View Profiles", "Edit Own Profile", "Edit Any Profile", "Add/Remove People"] },
    { category: "Time & Attendance", items: ["View Own Timesheet", "Edit Own Timesheet", "Approve Timesheets", "Manage Shifts"] },
    { category: "Leaves", items: ["Request Leave", "Approve Leave", "Manage Policies"] },
    { category: "System", items: ["Manage Roles", "View Audit Logs", "Configure Settings"] },
  ]

  // Mock boolean check
  const hasPermission = (role: string, item: string) => {
    if (role === "Admin") return true;
    if (role === "Employee" && (item.includes("Own") || item === "View Directory" || item === "Request Leave")) return true;
    if (role === "HR Manager" && !item.includes("System")) return true;
    if (role === "Department Head" && (item.includes("Approve") || item === "View Directory" || item.includes("Own") || item === "Request Leave" || item === "View Profiles")) return true;
    return false;
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border bg-surface-base">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Roles & Permissions Matrix</h2>
            <p className="text-sm text-muted-foreground">Define what different roles can access and perform.</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-6 py-4 text-left font-semibold text-foreground min-w-[200px]">Permission</th>
              {roles.map(role => (
                <th key={role} className="px-4 py-4 text-center">
                  <div className="font-semibold text-foreground text-sm whitespace-nowrap">{role}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Users size={10} /> {Math.floor(Math.random() * 50) + 1} users
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {permissions.map(group => (
              <React.Fragment key={group.category}>
                <tr className="bg-muted/10">
                  <td colSpan={roles.length + 1} className="px-6 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {group.category}
                  </td>
                </tr>
                {group.items.map(item => (
                  <tr key={item} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{item}</td>
                    {roles.map(role => {
                      const granted = hasPermission(role, item)
                      return (
                        <td key={`${role}-${item}`} className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            {granted ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full text-muted-foreground/30 flex items-center justify-center">
                                <X size={12} strokeWidth={2} />
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
