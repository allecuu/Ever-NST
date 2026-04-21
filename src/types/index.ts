import type { Decimal } from "@prisma/client-runtime-utils"

export type Role = "USER" | "ADMIN"
export type { Decimal }

export type Product = {
  id: string
  name: string
  slug: string
  description?: string
  price: number | Decimal
  stock: number
  images: string[]
  features: string[]
  categoryId: string
  category?: Category
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date
}

export type Order = {
  id: string
  userId: string
  status: OrderStatus
  total: number | Decimal
  items: OrderItem[]
  address?: string
  phone?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number | Decimal
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
