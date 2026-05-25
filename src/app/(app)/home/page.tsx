import { getDbUser } from "@/lib/auth/auth"
import { getOrderHistory, getUserStats } from "@/lib/actions/scan.actions"
import { HomeFeature } from "@/features/home"

export default async function HomePage() {
  const user = await getDbUser()
  const ordersResult = await getOrderHistory()
  const statsResult = await getUserStats()
  const orders = ordersResult.success ? ordersResult.data : []
  const stats = statsResult.success ? statsResult.data : { totalScans: 0, totalPlasticG: 0 }

  return (
    <HomeFeature
      userName={user.name}
      district={user.district}
      orders={orders}
      totalScans={stats.totalScans}
      totalPlasticG={stats.totalPlasticG}
    />
  )
}
