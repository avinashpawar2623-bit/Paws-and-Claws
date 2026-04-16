import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Unhandled UI error', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-error">
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
        </section>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
