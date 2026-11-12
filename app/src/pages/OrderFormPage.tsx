import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PurchaseOrderForm } from '../components/PurchaseOrderForm'
import { createOrder, updateOrder } from '../lib/orders'
import type { OrderFormValues } from '../lib/orderSchema'
import { can } from '../lib/permissions'
import { applyTransition, isEditable } from '../lib/transitions'
import { useApp } from '../state/AppContext'

function Blocked({ text }: { text: string }) {
  return (
    <div className="st-card flex flex-col items-center gap-3 p-10 text-center" role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
        <ShieldAlert size={22} aria-hidden />
      </span>
      <p className="text-slate-700">{text}</p>
      <Link to="/orders" className="text-sm font-medium text-teal-800 hover:underline">
        Back to purchase orders
      </Link>
    </div>
  )
}

/** Create (`/orders/new`) and edit (`/orders/:orderId/edit`) screen. */
export function OrderFormPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { data, setData, currentUser, notify } = useApp()
  const editing = orderId !== undefined
  const order = editing ? data.orders.find((o) => o.orderId === orderId) : undefined

  if (!can(currentUser.role, editing ? 'order.edit' : 'order.create')) {
    return <Blocked text="Your role is not allowed to create or edit purchase orders. Switch role in Settings." />
  }
  if (editing && !order) return <Blocked text="That purchase order does not exist." />
  if (order && !isEditable(order)) {
    return <Blocked text={`${order.orderId} is ${order.status} and can no longer be edited.`} />
  }

  const handleSave = (values: OrderFormValues, submitForApproval: boolean) => {
    try {
      if (order) {
        let next = updateOrder(data, order.orderId, values)
        if (submitForApproval && order.status === 'Draft') {
          next = applyTransition(next, order.orderId, 'Pending Approval', currentUser.userId)
        }
        setData(() => next)
        notify(`${order.orderId} updated.`)
        navigate(`/orders/${order.orderId}`)
      } else {
        const created = createOrder(data, values, currentUser.userId, submitForApproval ? 'Pending Approval' : 'Draft')
        setData(() => created.data)
        notify(`${created.orderId} created${submitForApproval ? ' and submitted for approval' : ' as a draft'}.`)
        navigate(`/orders/${created.orderId}`)
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save the order.', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <Link to={order ? `/orders/${order.orderId}` : '/orders'} className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline">
        <ArrowLeft size={16} aria-hidden /> Back
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{order ? `Edit ${order.orderId}` : 'Create purchase order'}</h1>
      <PurchaseOrderForm
        vendors={data.vendors}
        defaultValues={
          order
            ? { vendorId: order.vendorId, expectedDeliveryDate: order.expectedDeliveryDate, items: order.items }
            : undefined
        }
        allowSubmit={!order || order.status === 'Draft'}
        submitLabel={order ? 'Save changes' : 'Save as draft'}
        onSave={handleSave}
        onCancel={() => navigate(order ? `/orders/${order.orderId}` : '/orders')}
      />
    </div>
  )
}
