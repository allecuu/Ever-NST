import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  categoryId: z.string().min(1),
  isActive: z.boolean().default(true),
})

export const productUpdateSchema = productSchema.partial()

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
})

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
})

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type OrderInput = z.infer<typeof orderSchema>
export type OrderStatusInput = z.infer<typeof orderStatusSchema>
export const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
})

export const blogPostUpdateSchema = blogPostSchema.partial()

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BlogPostInput = z.infer<typeof blogPostSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>
