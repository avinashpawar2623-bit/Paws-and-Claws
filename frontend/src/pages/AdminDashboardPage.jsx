import { useEffect, useState } from 'react'
import {
  downloadOrdersCsv,
  fetchAdminDashboard,
  fetchAuditLogs,
  fetchUsers,
  updateUserStatus,
} from '../services/dashboardService'
import { fetchOrders, updateOrderStatus } from '../services/orderService'
import { fetchModerationQueue, moderateProduct } from '../services/productService'

function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [savingUserId, setSavingUserId] = useState('')
  const [savingOrderId, setSavingOrderId] = useState('')
  const [savingProductId, setSavingProductId] = useState('')
  const [exportingOrders, setExportingOrders] = useState(false)
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    paymentStatus: '',
    orderId: '',
    userId: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboard, usersResponse, logsResponse, ordersResponse, productsResponse] = await Promise.all([
          fetchAdminDashboard(),
          fetchUsers(),
          fetchAuditLogs(),
          fetchOrders(),
          fetchModerationQueue(),
        ])
        setData(dashboard)
        setUsers(usersResponse.users || [])
        setAuditLogs(logsResponse.logs || [])
        setOrders(ordersResponse.orders || [])
        setProducts(productsResponse.items || [])
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

  const loadOrders = async (filters = orderFilters) => {
    const response = await fetchOrders({
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      orderId: filters.orderId || undefined,
      userId: filters.userId || undefined,
    })
    setOrders(response.orders || [])
  }

  const handleToggleSuspension = async (user) => {
    setSavingUserId(user._id)
    setError('')
    try {
      await updateUserStatus(user._id, {
        isSuspended: !user.isSuspended,
        suspendedReason: !user.isSuspended ? 'Suspended by admin' : '',
      })
      const [usersResponse, logsResponse, dashboard] = await Promise.all([
        fetchUsers(),
        fetchAuditLogs(),
        fetchAdminDashboard(),
      ])
      setUsers(usersResponse.users || [])
      setAuditLogs(logsResponse.logs || [])
      setData(dashboard)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Failed to update user status.'
      )
    } finally {
      setSavingUserId('')
    }
  }

  const handleOrderUpdate = async (orderId, payload) => {
    setSavingOrderId(orderId)
    setError('')
    try {
      await updateOrderStatus(orderId, payload)
      const [logsResponse, dashboard] = await Promise.all([
        fetchAuditLogs(),
        fetchAdminDashboard(),
      ])
      setAuditLogs(logsResponse.logs || [])
      setData(dashboard)
      await loadOrders()
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Failed to update order.'
      )
    } finally {
      setSavingOrderId('')
    }
  }

  const handleOrderFilterSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await loadOrders(orderFilters)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Failed to filter orders.'
      )
    }
  }

  const loadProductsForModeration = async () => {
    const response = await fetchModerationQueue()
    setProducts(response.items || [])
  }

  const handleModerateProduct = async (productId, approvalStatus) => {
    setSavingProductId(productId)
    setError('')
    try {
      await moderateProduct(productId, {
        approvalStatus,
        moderationReason:
          approvalStatus === 'rejected' ? 'Rejected by admin' : '',
      })
      const [logsResponse, dashboard] = await Promise.all([
        fetchAuditLogs(),
        fetchAdminDashboard(),
      ])
      setAuditLogs(logsResponse.logs || [])
      setData(dashboard)
      await loadProductsForModeration()
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Failed to moderate product.'
      )
    } finally {
      setSavingProductId('')
    }
  }

  const handleExportOrders = async () => {
    setExportingOrders(true)
    setError('')
    try {
      const blob = await downloadOrdersCsv()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'orders-report.csv'
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Failed to export orders report.'
      )
    } finally {
      setExportingOrders(false)
    }
  }

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <div className="page-actions">
        <button type="button" onClick={handleExportOrders} disabled={exportingOrders}>
          {exportingOrders ? 'Exporting...' : 'Export Orders CSV'}
        </button>
      </div>
      <p>Users: {data.analytics.userCount}</p>
      <p>Suspended Users: {data.analytics.suspendedUserCount}</p>
      <p>Products: {data.analytics.productCount}</p>
      <p>Orders: {data.analytics.orderCount}</p>
      <p>Total Revenue: ${Number(data.analytics.totalRevenue || 0).toFixed(2)}</p>

      <h3>System Health</h3>
      <p>API Status: {data.systemHealth?.apiStatus || 'unknown'}</p>
      <p>Database: {data.systemHealth?.databaseStatus || 'unknown'}</p>
      <p>Uptime: {Number(data.systemHealth?.uptimeSeconds || 0)}s</p>
      <p>
        Memory RSS: {Number(data.systemHealth?.memoryRssMb || 0).toFixed(2)} MB
      </p>
      <p>
        Heap Used:{' '}
        {Number(data.systemHealth?.memoryHeapUsedMb || 0).toFixed(2)} MB
      </p>
      <p>Notifications (24h): {data.systemHealth?.notificationsLast24h || 0}</p>
      <p>Payments (24h): {data.systemHealth?.paymentsLast24h || 0}</p>
      <p>Snapshot: {data.systemHealth?.generatedAt || '-'}</p>

      <h3>Recent Orders</h3>
      <ul>
        {data.recentOrders.map((order) => (
          <li key={order._id}>
            {order._id} - {order.status} - ${Number(order.totalPrice).toFixed(2)}
          </li>
        ))}
      </ul>

      <h3>User Management</h3>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="order-list">
          {users.map((user) => (
            <article key={user._id} className="product-card">
              <p>
                <strong>{user.name}</strong> ({user.role})
              </p>
              <p>{user.email}</p>
              <p>Status: {user.isSuspended ? 'Suspended' : 'Active'}</p>
              <button
                type="button"
                disabled={savingUserId === user._id}
                onClick={() => handleToggleSuspension(user)}
              >
                {savingUserId === user._id
                  ? 'Saving...'
                  : user.isSuspended
                    ? 'Reactivate'
                    : 'Suspend'}
              </button>
            </article>
          ))}
        </div>
      )}

      <h3>Audit Log</h3>
      {auditLogs.length === 0 ? (
        <p>No audit activity yet.</p>
      ) : (
        <ul>
          {auditLogs.map((log) => (
            <li key={log._id}>
              {new Date(log.createdAt).toLocaleString()} - {log.action} -{' '}
              {log.entityType} {log.entityId}
            </li>
          ))}
        </ul>
      )}

      <h3>Order Management</h3>
      <form className="auth-form" onSubmit={handleOrderFilterSubmit}>
        <label htmlFor="filter-order-id">Order ID</label>
        <input
          id="filter-order-id"
          value={orderFilters.orderId}
          onChange={(event) =>
            setOrderFilters((prev) => ({ ...prev, orderId: event.target.value }))
          }
        />
        <label htmlFor="filter-user-id">User ID</label>
        <input
          id="filter-user-id"
          value={orderFilters.userId}
          onChange={(event) =>
            setOrderFilters((prev) => ({ ...prev, userId: event.target.value }))
          }
        />
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={orderFilters.status}
          onChange={(event) =>
            setOrderFilters((prev) => ({ ...prev, status: event.target.value }))
          }
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <label htmlFor="filter-payment-status">Payment Status</label>
        <select
          id="filter-payment-status"
          value={orderFilters.paymentStatus}
          onChange={(event) =>
            setOrderFilters((prev) => ({
              ...prev,
              paymentStatus: event.target.value,
            }))
          }
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <button type="submit">Apply Filters</button>
      </form>

      {orders.length === 0 ? (
        <p>No matching orders found.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article key={order._id} className="product-card">
              <p>
                <strong>{order._id}</strong>
              </p>
              <p>User: {String(order.userId)}</p>
              <p>Total: ${Number(order.totalPrice || 0).toFixed(2)}</p>
              <p>Status: {order.status}</p>
              <p>Payment: {order.paymentStatus}</p>
              <div className="filters-row">
                <select
                  value={order.status}
                  onChange={(event) =>
                    handleOrderUpdate(order._id, {
                      status: event.target.value,
                      paymentStatus: order.paymentStatus,
                    })
                  }
                  disabled={savingOrderId === order._id}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={order.paymentStatus}
                  onChange={(event) =>
                    handleOrderUpdate(order._id, {
                      status: order.status,
                      paymentStatus: event.target.value,
                    })
                  }
                  disabled={savingOrderId === order._id}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}

      <h3>Product Moderation</h3>
      {products.length === 0 ? (
        <p>No pending/rejected products to review.</p>
      ) : (
        <div className="order-list">
          {products.map((product) => (
              <article key={product._id} className="product-card">
                <p>
                  <strong>{product.name}</strong>
                </p>
                <p>Status: {product.approvalStatus || 'pending'}</p>
                <p>Vendor: {product.vendor?.name || 'Vendor'}</p>
                <p>Category: {product.category}</p>
                <p>Price: ${Number(product.price || 0).toFixed(2)}</p>
                {product.moderationReason ? (
                  <p>Reason: {product.moderationReason}</p>
                ) : null}
                <div className="filters-row">
                  <button
                    type="button"
                    disabled={savingProductId === product._id}
                    onClick={() => handleModerateProduct(product._id, 'approved')}
                  >
                    {savingProductId === product._id ? 'Saving...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={savingProductId === product._id}
                    onClick={() => handleModerateProduct(product._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}
    </section>
  )
}

export default AdminDashboardPage
