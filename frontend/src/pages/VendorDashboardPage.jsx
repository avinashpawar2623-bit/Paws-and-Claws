import { useEffect, useState } from 'react'
import { fetchVendorDashboard } from '../services/dashboardService'
import {
  fetchMyVendorShop,
  updateMyVendorShop,
} from '../services/vendorShopService'

function VendorDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [shopForm, setShopForm] = useState({
    shopName: '',
    slug: '',
    description: '',
    accentColor: '#6b7280',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboard, shopResponse] = await Promise.all([
          fetchVendorDashboard(),
          fetchMyVendorShop(),
        ])
        setData(dashboard)
        const shop = shopResponse.shop || {}
        setShopForm({
          shopName: shop.shopName || '',
          slug: shop.slug || '',
          description: shop.description || '',
          accentColor: shop.accentColor || '#6b7280',
        })
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

  const handleSaveShop = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await updateMyVendorShop(shopForm)
      setShopForm({
        shopName: response.shop.shopName || '',
        slug: response.shop.slug || '',
        description: response.shop.description || '',
        accentColor: response.shop.accentColor || '#6b7280',
      })
      const dashboard = await fetchVendorDashboard()
      setData(dashboard)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Failed to save vendor shop.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      <h1>Vendor Dashboard</h1>
      <p>My Products: {data.analytics.productCount}</p>
      <p>Units Sold: {data.analytics.totalUnitsSold}</p>
      <p>Paid Orders: {data.analytics.paidOrdersCount}</p>
      <p>
        Estimated Revenue: $
        {Number(data.analytics.estimatedRevenue || 0).toFixed(2)}
      </p>
      <p>
        Average Order Value: $
        {Number(data.analytics.averageOrderValue || 0).toFixed(2)}
      </p>
      <p>Shop Tier: {data.analytics.shopTier}</p>
      <p>Verified: {data.analytics.shopVerified ? 'Yes' : 'No'}</p>

      {data.shop?.slug ? (
        <p>
          Public Shop: <a href={`/shops/${data.shop.slug}`}>/shops/{data.shop.slug}</a>
        </p>
      ) : null}

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

      <h3>Shop Profile</h3>
      <form className="auth-form" onSubmit={handleSaveShop}>
        <label htmlFor="shop-name">Shop Name</label>
        <input
          id="shop-name"
          value={shopForm.shopName}
          onChange={(event) =>
            setShopForm((prev) => ({ ...prev, shopName: event.target.value }))
          }
        />
        <label htmlFor="shop-slug">Shop Slug</label>
        <input
          id="shop-slug"
          value={shopForm.slug}
          onChange={(event) =>
            setShopForm((prev) => ({ ...prev, slug: event.target.value }))
          }
        />
        <label htmlFor="shop-description">Description</label>
        <input
          id="shop-description"
          value={shopForm.description}
          onChange={(event) =>
            setShopForm((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
        />
        <label htmlFor="shop-color">Accent Color</label>
        <input
          id="shop-color"
          type="color"
          value={shopForm.accentColor}
          onChange={(event) =>
            setShopForm((prev) => ({
              ...prev,
              accentColor: event.target.value,
            }))
          }
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Shop'}
        </button>
      </form>
    </section>
  )
}

export default VendorDashboardPage
