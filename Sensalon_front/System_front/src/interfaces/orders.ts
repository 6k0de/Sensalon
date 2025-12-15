export interface Order {
  id: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  meta?: any
}

export type OrderStatus = 'processing' | 'approved' | 'error'

export type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}