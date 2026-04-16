import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchWallet, topUpWallet } from '../services/walletService'

function WalletPage() {
  const { user } = useAuth()
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const data = await fetchWallet()
        setWalletBalance(data.walletBalance)
        setTransactions(data.transactions)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            'Unable to load wallet information.'
        )
      }
    }
    loadWallet()
  }, [])

  const handleTopUp = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const parsed = Number(amount)
      if (!parsed || parsed <= 0) {
        setError('Enter a valid amount greater than zero.')
        return
      }
      const data = await topUpWallet(parsed)
      setWalletBalance(data.walletBalance)
      setAmount('')
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to top up wallet.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page">
      <h1>Wallet</h1>
      <p>User: {user?.name}</p>
      <p>
        Current balance: <strong>${walletBalance.toFixed(2)}</strong>
      </p>

      <form className="auth-form" onSubmit={handleTopUp}>
        <label htmlFor="wallet-amount">Top-up amount</label>
        <input
          id="wallet-amount"
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Top Up Wallet'}
        </button>
      </form>

      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No wallet activity yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
                <td>{tx.type}</td>
                <td>{tx.reason}</td>
                <td>${Number(tx.amount).toFixed(2)}</td>
                <td>${Number(tx.balanceAfter).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default WalletPage

