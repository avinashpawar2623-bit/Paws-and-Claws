import { createContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  addCartItem,
  clearCart as clearCartApi,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../services/cartService'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState({ items: [], totalPrice: 0 })
  const [loading, setLoading] = useState(false)

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalPrice: 0 })
      return
    }
    setLoading(true)
    try {
      const response = await getCart()
      setCart(response.cart || { items: [], totalPrice: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const addItem = async (productId, quantity = 1) => {
    const response = await addCartItem({ productId, quantity })
    setCart(response.cart)
  }

  const updateItem = async (itemId, quantity) => {
    const response = await updateCartItem(itemId, { quantity })
    setCart(response.cart)
  }

  const removeItem = async (itemId) => {
    const response = await removeCartItem(itemId)
    setCart(response.cart)
  }

  const clearCart = async () => {
    const response = await clearCartApi()
    setCart(response.cart)
  }

  const value = useMemo(
    () => ({
      cart,
      loading,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [cart, loading]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
