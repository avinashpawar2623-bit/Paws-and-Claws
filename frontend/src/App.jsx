import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductManagePage from './pages/ProductManagePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import VendorDashboardPage from './pages/VendorDashboardPage'
import WalletPage from './pages/WalletPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import NotificationsPage from './pages/NotificationsPage'
import VendorShopPage from './pages/VendorShopPage'
import WishlistPage from './pages/WishlistPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="shops/:slug" element={<VendorShopPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin', 'vendor']} />}>
          <Route path="vendor/products/new" element={<ProductManagePage />} />
          <Route path="vendor/dashboard" element={<VendorDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
