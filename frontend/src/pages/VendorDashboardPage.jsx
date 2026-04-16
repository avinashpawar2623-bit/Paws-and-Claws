import { useEffect, useState } from 'react'
import { fetchVendorDashboard } from '../services/dashboardService'

function VendorDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchVendorDashboard()
        setData(response)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Failed to load vendor dashboard.'
        )
      }
    }
    load()
  }, [])

  if (error) return <section className="page form-error">{error}</section>
  if (!data) return <section className="page">Loading dashboard...</section>

  return (
    <section className="page">
      <h1>Vendor Dashboard</h1>
      <p>My Products: {data.analytics.productCount}</p>
      <p>Units Sold: {data.analytics.totalUnitsSold}</p>
      <p>
        Estimated Revenue: $
        {Number(data.analytics.estimatedRevenue || 0).toFixed(2)}
      </p>
      <h3>Low Stock Products</h3>
      {data.analytics.lowStockProducts.length === 0 ? (
        <p>No low stock products.</p>
      ) : (
        <ul>
          {data.analytics.lowStockProducts.map((item) => (
            <li key={item._id}>
              {item.name} - stock: {item.stock}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default VendorDashboardPage
