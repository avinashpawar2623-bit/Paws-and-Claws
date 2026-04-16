import { useEffect, useState } from 'react'
import { fetchAdminDashboard } from '../services/dashboardService'

function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchAdminDashboard()
        setData(response)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Failed to load admin dashboard.'
        )
      }
    }
    load()
  }, [])

  if (error) return <section className="page form-error">{error}</section>
  if (!data) return <section className="page">Loading dashboard...</section>

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <p>Users: {data.analytics.userCount}</p>
      <p>Products: {data.analytics.productCount}</p>
      <p>Orders: {data.analytics.orderCount}</p>
      <p>Total Revenue: ${Number(data.analytics.totalRevenue || 0).toFixed(2)}</p>
      <h3>Recent Orders</h3>
      <ul>
        {data.recentOrders.map((order) => (
          <li key={order._id}>
            {order._id} - {order.status} - ${Number(order.totalPrice).toFixed(2)}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default AdminDashboardPage
