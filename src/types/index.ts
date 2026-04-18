export type Role = "USER" | "ADMIN"

export type Product = {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  stock: number
  images: string[]
  categoryId?: string
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
}

export type Order = {
  id: string
  userId: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  createdAt: Date
}

export type OrderItem = {
  id: string
  productId: string
  quantity: number
  price: number
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
