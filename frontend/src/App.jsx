import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const ProductManagePage = lazy(() => import('./pages/ProductManagePage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'))
const WalletPage = lazy(() => import('./pages/WalletPage'))
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const VendorShopPage = lazy(() => import('./pages/VendorShopPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))

function RouteLoader() {
  return <section className="app-loader">Loading page...</section>
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
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
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
