export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_SHIPMENT = 'PENDING_SHIPMENT',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  AFTER_SALE = 'AFTER_SALE',
}

export enum PaymentMethod {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
}

export interface OrderSpec {
  size: string
  material: string
  frameStyle: string
}

export interface OrderItem {
  artworkId: string
  artworkTitle: string
  artworkImage: string
  artistName: string
  spec: OrderSpec
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalPrice: number
  shippingFee: number
  discountAmount: number
  actualPrice: number
  status: OrderStatus
  shippingInfo: string
  paymentMethod: PaymentMethod
  paymentTime: string
  remark: string
  createdAt: string
  updatedAt: string
}
