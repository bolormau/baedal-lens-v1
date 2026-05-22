import { getDbUser } from "@/lib/auth/auth"
import { getOrderHistory } from "@/lib/actions/scan.actions"
import { HomeFeature } from "@/features/home"

export default async function HomePage() {
  const user = await getDbUser()
  const ordersResult = await getOrderHistory()
  const orders = ordersResult.success ? ordersResult.data : []

  return (
    <HomeFeature
      userName={user.name}
      district={user.district}
      orders={orders}
    />
  )
}
