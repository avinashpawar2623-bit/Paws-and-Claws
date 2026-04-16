import { useState } from 'react'
import { createProduct, uploadProductImage } from '../services/productService'

const defaultForm = {
  name: '',
  description: '',
  category: 'food',
  price: '',
  stock: '',
}

function ProductManagePage() {
  const [form, setForm] = useState(defaultForm)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const created = await createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      })
      if (imageFile && created?.item?._id) {
        await uploadProductImage(created.item._id, imageFile)
      }
      setMessage('Product created successfully.')
      setForm(defaultForm)
      setImageFile(null)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to create product.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page">
      <h1>Create Product</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="product-name">Name</label>
        <input
          id="product-name"
          name="name"
          value={form.name}
          onChange={updateField}
          required
        />

        <label htmlFor="product-description">Description</label>
        <input
          id="product-description"
          name="description"
          value={form.description}
          onChange={updateField}
        />

        <label htmlFor="product-category">Category</label>
        <select
          id="product-category"
          name="category"
          value={form.category}
          onChange={updateField}
        >
          <option value="food">Food</option>
          <option value="health">Health</option>
          <option value="toys">Toys</option>
          <option value="accessories">Accessories</option>
        </select>

        <label htmlFor="product-price">Price</label>
        <input
          id="product-price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={updateField}
          required
        />

        <label htmlFor="product-stock">Stock</label>
        <input
          id="product-stock"
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={updateField}
          required
        />

        <label htmlFor="product-image">Image (optional)</label>
        <input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={(event) => setImageFile(event.target.files?.[0] || null)}
        />

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save product'}
        </button>
      </form>
    </section>
  )
}

export default ProductManagePage
