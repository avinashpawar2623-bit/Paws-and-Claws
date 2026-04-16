import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page">
      <h1>Page Not Found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/">Go back home</Link>
    </section>
  )
}

export default NotFoundPage
