import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().optional().nullable()
})

export const documentSchema = z.object({
  title: z.string().min(3, "Document title required").max(200),
  categoryId: z.string().uuid("Invalid category ID"),
  employeeId: z.string().uuid("Invalid employee ID"),
  fileSize: z.number().max(10 * 1024 * 1024, "File size must be under 10MB"), // 10MB
})

export function validatePayload<T>(schema: z.ZodType<T>, payload: unknown): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(payload)
  
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors
    return { 
      success: false, 
      errors: formattedErrors as Record<string, string[]> 
    }
  }
  
  return { success: true, data: result.data }
}
