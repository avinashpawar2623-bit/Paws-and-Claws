import { useEffect, useState } from 'react'
import {
  cancelSubscription,
  createSubscription,
  fetchSubscriptions,
} from '../services/subscriptionService'

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadSubscriptions = async () => {
    try {
      const data = await fetchSubscriptions()
      setSubscriptions(data.subscriptions)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to load subscriptions.'
      )
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const handleSubscribe = async (plan) => {
    setError('')
    setLoading(true)
    try {
      await createSubscription(plan)
      await loadSubscriptions()
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to create subscription.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    setError('')
    setLoading(true)
    try {
      await cancelSubscription(id)
      await loadSubscriptions()
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to cancel subscription.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page">
      <h1>Subscriptions</h1>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="subscriptions-grid">
        <article className="subscription-card">
          <h2>Vendor Premium</h2>
          <p>Advanced analytics and marketplace perks for vendors.</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubscribe('vendor_premium')}
          >
            {loading ? 'Processing...' : 'Subscribe as Vendor'}
          </button>
        </article>
        <article className="subscription-card">
          <h2>Customer Loyalty Plus</h2>
          <p>Extra rewards, priority support and exclusive offers.</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubscribe('customer_loyalty_plus')}
          >
            {loading ? 'Processing...' : 'Subscribe as Customer'}
          </button>
        </article>
      </div>

      <h2>Your Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <p>No active subscriptions.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Status</th>
              <th>Started</th>
              <th>Renews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.plan}</td>
                <td>{sub.status}</td>
                <td>{new Date(sub.startedAt).toLocaleDateString()}</td>
                <td>{new Date(sub.renewsAt).toLocaleDateString()}</td>
                <td>
                  {sub.status === 'active' ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCancel(sub._id)}
                    >
                      Cancel
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default SubscriptionsPage

