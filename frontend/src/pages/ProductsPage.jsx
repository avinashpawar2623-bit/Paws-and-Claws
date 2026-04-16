import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProductSuggestions, fetchProducts } from '../services/productService'

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const toCsvArray = (value) =>
    String(value || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

  const categoryLegacy = searchParams.get('category') || ''
  const categoriesParam = searchParams.get('categories') || ''
  const selectedCategories = toCsvArray(categoriesParam || categoryLegacy)

  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || 1)
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const inStock = searchParams.get('inStock') === 'true'

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchProducts({
          search: search || undefined,
          categories: selectedCategories.length ? selectedCategories.join(',') : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          inStock: inStock ? 'true' : undefined,
          page,
          limit: 8,
          sortBy,
          sortOrder,
          // Future Phase 8: additional facets (breed/age/vaccination/etc.)
        })
        setItems(response.items || [])
        setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 })
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || 'Failed to load products.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [
    selectedCategories.join(','),
    search,
    page,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    inStock,
  ])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const q = search.trim()
      if (!q || q.length < 2) {
        setSuggestions([])
        return
      }
      try {
        const data = await fetchProductSuggestions(q)
        if (!cancelled) setSuggestions(data.suggestions || [])
      } catch (_e) {
        if (!cancelled) setSuggestions([])
      }
    }

    const t = setTimeout(run, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [search])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'categories') next.delete('category')
    if (key !== 'page') next.set('page', '1')
    setSearchParams(next)
  }

  const toggleCategory = (value) => {
    const next = selectedCategories.includes(value)
      ? selectedCategories.filter((c) => c !== value)
      : [...selectedCategories, value]
    updateParam('categories', next.length ? next.join(',') : '')
  }

  return (
    <section className="page">
      <h1>Products</h1>
      <div className="filters-row">
        <input
          placeholder="Search products..."
          value={search}
          list="product-suggestions"
          onChange={(event) => updateParam('search', event.target.value)}
        />
        <datalist id="product-suggestions">
          {suggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(event) => updateParam('minPrice', event.target.value)}
          min="0"
          step="0.01"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(event) => updateParam('maxPrice', event.target.value)}
          min="0"
          step="0.01"
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) =>
              updateParam('inStock', event.target.checked ? 'true' : '')
            }
          />
          In stock
        </label>
        <div className="checkbox-group" role="group" aria-label="Categories">
          {['food', 'health', 'toys', 'accessories'].map((cat) => (
            <label key={cat} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat[0].toUpperCase() + cat.slice(1)}
            </label>
          ))}
        </div>
        <select value={sortBy} onChange={(event) => updateParam('sortBy', event.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="relevance">Relevance</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="name">Name</option>
        </select>
        <select
          value={sortOrder}
          onChange={(event) => updateParam('sortOrder', event.target.value)}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading ? <p>Loading products...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <p>Total products: {pagination.total}</p>
          <div className="product-grid">
            {items.map((item) => (
              <article key={item._id} className="product-card">
                {item.cloudinaryUrl ? (
                  <img src={item.cloudinaryUrl} alt={item.name} className="product-image" />
                ) : null}
                <h3>{item.name}</h3>
                <p>${Number(item.price).toFixed(2)}</p>
                <p>Category: {item.category}</p>
                <p>Rating: {Number(item.rating || 0).toFixed(1)}</p>
                <Link to={`/products/${item._id}`}>View details</Link>
              </article>
            ))}
          </div>

          <div className="pagination-row">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => updateParam('page', String(page + 1))}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default ProductsPage
