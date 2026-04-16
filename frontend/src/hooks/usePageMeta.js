import { useEffect } from 'react'

const DEFAULT_DESCRIPTION =
  'Paws and Claws is a pet-focused marketplace for supplies, care content, and trusted vendors.'

export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Paws and Claws`
    } else {
      document.title = 'Paws and Claws'
    }

    const metaDescription =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const tag = document.createElement('meta')
        tag.name = 'description'
        document.head.appendChild(tag)
        return tag
      })()

    metaDescription.setAttribute('content', description || DEFAULT_DESCRIPTION)
  }, [title, description])
}
