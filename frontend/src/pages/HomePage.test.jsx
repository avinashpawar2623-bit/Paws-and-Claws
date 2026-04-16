import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'

vi.mock('../services/productService', () => ({
  fetchTrendingProducts: vi.fn().mockResolvedValue({
    trending: [
      {
        unitsSold: 12,
        product: {
          _id: 'product-1',
          name: 'Premium Pup Bowl',
          price: 19.99,
        },
      },
    ],
  }),
}))

vi.mock('../services/blogService', () => ({
  fetchBlogPosts: vi.fn().mockResolvedValue({
    posts: [
      {
        slug: 'pet-care-tips',
        title: 'Pet Care Tips',
        excerpt: 'Keep tails wagging.',
      },
    ],
  }),
}))

describe('HomePage', () => {
  it('renders trending products and blog posts', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    )

    expect(screen.getByText(/welcome to paws and claws/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/premium pup bowl/i)).toBeInTheDocument()
      expect(screen.getByText(/pet care tips/i)).toBeInTheDocument()
    })
  })
})
