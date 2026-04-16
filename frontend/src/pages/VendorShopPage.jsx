import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchVendorShopBySlug } from '../services/vendorShopService'
import { usePageMeta } from '../hooks/usePageMeta'

function VendorShopPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  usePageMeta({
    title: data?.shop?.shopName || 'Vendor Shop',
    description:
      data?.shop?.description ||
      'Explore products and seller details from a Paws and Claws marketplace vendor.',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchVendorShopBySlug(slug)
        setData(response)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Failed to load vendor shop.'
        )
      }
    }
    load()
  }, [slug])

  if (error) return <section className="page form-error">{error}</section>
  if (!data) return <section className="page">Loading shop...</section>

  const { shop, vendor, products } = data

  return (
    <section className="page">
      <h1 style={{ color: shop.accentColor || '#111827' }}>{shop.shopName}</h1>
      <p>{shop.description || 'No shop description yet.'}</p>
      <p>Vendor: {vendor?.name || 'Vendor'}</p>
      <p>Tier: {shop.tier}</p>
      <p>Verified: {shop.isVerified ? 'Yes' : 'No'}</p>

      <h2>Products</h2>
      {products.length === 0 ? (
        <p>No products available in this shop yet.</p>
      ) : (
        <div className="product-grid">
          {products.map((item) => (
            <article key={item._id} className="product-card">
              {item.cloudinaryUrl ? (
                <img
                  src={item.cloudinaryUrl}
                  alt={item.name}
                  className="product-image"
                />
              ) : null}
              <h3>{item.name}</h3>
              <p>${Number(item.price || 0).toFixed(2)}</p>
              <Link to={`/products/${item._id}`}>View details</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default VendorShopPage
