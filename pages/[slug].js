import { useEffect } from 'react'
import { useRouter } from 'next/router'

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
        router.push('/?error=URL not found')
        return
      }

      const urls = JSON.parse(savedUrls)
      const urlData = urls.find(u => u.slug === slug)

      if (!urlData) {
        router.push('/?error=URL not found')
        return
      }

      // Update click count
      const updatedUrls = urls.map(url => 
        url.slug === slug 
          ? { ...url, clicks: (url.clicks || 0) + 1 }
          : url
      )
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls))

      // Redirect to original URL
      window.location.href = urlData.url

    } catch (error) {
      console.error('Redirect error:', error)
      router.push('/?error=Redirect failed')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🔄 Redirecting...</h1>
        <p>Please wait while we redirect you to the destination.</p>
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #fff',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
