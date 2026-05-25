import { getOrderHistory } from "@/lib/actions/scan.actions"
import { getDbUser } from "@/lib/auth/auth"
import { CalendarFeature } from "@/features/calendar"

export default async function CalendarPage() {
  const [user, ordersResult] = await Promise.all([
    getDbUser(),
    getOrderHistory(),
  ])

  const orders = ordersResult.success ? ordersResult.data : []

  return (
    <CalendarFeature
      orders={orders}
      userName={user.name || "친구"}
    />
  )
}
