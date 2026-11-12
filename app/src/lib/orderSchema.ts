import { z } from 'zod'

export const itemSchema = z.object({
  itemId: z.string(),
  productName: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  orderedQuantity: z.number({ message: 'Enter a quantity' }).int('Quantity must be a whole number').positive('Quantity must be at least 1'),
  unitPrice: z.number({ message: 'Enter a price' }).min(0, 'Price cannot be negative'),
})

export const orderSchema = z.object({
  vendorId: z.string().min(1, 'Select a vendor'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
})
export type OrderFormValues = z.infer<typeof orderSchema>

export const vendorSchema = z.object({
  name: z.string().trim().min(2, 'Vendor name is required'),
  email: z.string().trim().email('Enter a valid email'),
  contact: z.string().trim().min(5, 'Contact number is required'),
})
export type VendorFormValues = z.infer<typeof vendorSchema>
