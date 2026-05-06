export type Role = "USER" | "ADMIN"

export type Product = {
  id: string
  name: string
  slug: string
  description?: string
  price: number | string
  stock: number
  images: string[]
  features: string[]
  categoryId: string
  category?: Category
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date | string
}

export type Order = {
  id: string
  userId: string
  status: OrderStatus
  total: number | string
  items: OrderItem[]
  address?: string
  phone?: string
  notes?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number | string
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
