import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { urlStorage } from '../lib/storage'

export default function SlugRedirect({ urlData }) {
  const router = useRouter()
  const { slug } = router.query

  useEffect(() => {
    if (urlData) {
      // Update click count and redirect
      urlStorage.incrementClicks(slug)
      window.location.href = urlData.url
    } else if (slug && !urlData) {
      // Client-side fallback
      const clientURL = urlStorage.findURLBySlug(slug)
      if (clientURL) {
        urlStorage.incrementClicks(slug)
        window.location.href = clientURL.url
      } else {
        window.location.href = '/?error=URL+not+found'
      }
    }
  }, [slug, urlData])

  if (!urlData) {
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
          <h1>❌ URL Not Found</h1>
          <p>The requested short URL was not found.</p>
          <a 
            href="/" 
            style={{
              color: 'white',
              textDecoration: 'underline',
              marginTop: '1rem',
              display: 'inline-block'
            }}
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  // Show nothing during redirect
  return (
    <div style={{ display: 'none' }}>
      <Head>
        <title>Redirecting to {urlData.url}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
    </div>
  )
}

// Server-side props for social media compatibility
export async function getServerSideProps(context) {
  const { slug } = context.params

  // For server-side, we can't access localStorage, so we'll handle it client-side
  // But we can set up proper meta tags for social media
  
  return {
    props: {
      urlData: null // Will be handled client-side
    }
  }
}
