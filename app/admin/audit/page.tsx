import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ShieldAlert, Monitor, Globe, Clock, User, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Audit & Compliance | SOMS Admin',
}

// Ensure dynamic rendering to fetch latest logs
export const dynamic = 'force-dynamic'

export default async function AuditDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const supabase = await createClient()
  const { query } = await searchParams

  // Supabase RLS handles this filtering automatically if configured!
  
  let dbQuery = supabase
    .from('audit_logs')
    .select(`
      *,
      profiles(first_name, last_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (query) {
    dbQuery = dbQuery.or(`action.ilike.%${query}%,resource.ilike.%${query}%`)
  }

  const { data: logs, error } = await dbQuery

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Audit & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Track user actions, access logs, and system events for security compliance.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>System Event Logs</CardTitle>
            <form className="flex w-full max-w-sm items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="query"
                  type="search"
                  placeholder="Search by action or resource..."
                  className="w-full pl-9"
                  defaultValue={query}
                />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action / Resource</TableHead>
                  <TableHead>Device / IP</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500 py-6">
                      Error loading audit logs. Make sure Supabase is connected.
                    </TableCell>
                  </TableRow>
                )}
                
                {!error && logs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No audit logs found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}

                {logs?.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.profiles ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{log.profiles.first_name} {log.profiles.last_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">System / Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className="w-fit mt-1 text-xs">
                          {log.resource}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {log.ip_address || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 truncate max-w-[200px]" title={log.user_agent}>
                          <Monitor className="w-3 h-3" /> {log.user_agent || 'Unknown Device'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DialogButton details={log.details} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Client component wrapper for the dialog button
function DialogButton({ details }: { details: any }) {
  // Since we're rendering this inside a Server Component, we need a small client component
  // to handle the dialog state if we want to show full JSON details.
  // For simplicity, we just render a button that console.logs for now, or use a popover.
  return (
    <Button variant="ghost" size="sm" onClick={() => console.log('Details:', details)}>
      <FileText className="w-4 h-4 mr-1" />
      View JSON
    </Button>
  )
}
