import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SlugRedirect() {
  const router = useRouter()
  const { slug } = router.query

  useEffect(() => {
    if (slug) {
      redirectToUrl(slug)
    }
  }, [slug])

  const redirectToUrl = (slug) => {
    try {
      // Get URLs from localStorage
      const savedUrls = localStorage.getItem('shortenedUrls')
      if (!savedUrls) {
        window.location.href = '/?error=URL+not+found'
        return
      }

      const urls = JSON.parse(savedUrls)
      const urlData = urls.find(u => u.slug === slug)

      if (!urlData) {
        window.location.href = '/?error=URL+not+found'
        return
      }

      // Update click count
      const updatedUrls = urls.map(url => 
        url.slug === slug 
          ? { ...url, clicks: (url.clicks || 0) + 1 }
          : url
      )
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls))

      // INSTANT REDIRECT - no loading screen
      window.location.href = urlData.url

    } catch (error) {
      console.error('Redirect error:', error)
      window.location.href = '/?error=Redirect+failed'
    }
  }

  // Show nothing during redirect
  return (
    <div style={{ 
      display: 'none' 
    }}>
      <Head>
        <title>Redirecting...</title>
      </Head>
    </div>
  )
}
