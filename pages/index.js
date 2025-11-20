import { useState, useEffect } from 'react'
import Head from 'next/head'
import { customAlphabet } from 'nanoid'
import { urlStorage } from '../lib/storage'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 6)

export default function Home() {
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [urls, setUrls] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load URLs from storage
  useEffect(() => {
    const savedUrls = urlStorage.getURLs()
    setUrls(savedUrls)
    
    // Check for error in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const errorMsg = urlParams.get('error')
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Validate URL
      if (!url) {
        setError('URL is required')
        setLoading(false)
        return
      }

      // Ensure URL has protocol
      let finalUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url
      }

      try {
        new URL(finalUrl)
      } catch (error) {
        setError('Invalid URL format. Please enter a valid URL.')
        setLoading(false)
        return
      }

      let finalSlug = slug || nanoid()

      // Validate slug format
      if (finalSlug && !/^[a-zA-Z0-9-_]+$/.test(finalSlug)) {
        setError('Slug can only contain letters, numbers, hyphens and underscores')
        setLoading(false)
        return
      }

      // Check if slug already exists
      const existingUrl = urlStorage.findURLBySlug(finalSlug)
      if (existingUrl) {
        setError('This slug is already taken. Please choose a different one.')
        setLoading(false)
        return
      }

      // Create new URL object
      const newUrl = {
        url: finalUrl,
        slug: finalSlug,
        shortUrl: `${window.location.origin}/${finalSlug}`
      }

      // Add to storage
      const createdUrl = urlStorage.addURL(newUrl)
      setUrls(urlStorage.getURLs())

      setShortUrl(createdUrl.shortUrl)
      setUrl('')
      setSlug('')
      
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    alert('Copied to clipboard!')
  }

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=Check%20this%20link`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  return (
    <div className="container">
      <Head>
        <title>Public URL Shortener - Free Link Shortening Service</title>
        <meta name="description" content="Free public URL shortener service. Create short links instantly for social media, messaging, and more." />
        <meta name="keywords" content="url shortener, link shortener, short links, free url shortener" />
        <meta property="og:title" content="Public URL Shortener" />
        <meta property="og:description" content="Free public URL shortener service for everyone" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
      </Head>

      <main>
        <div className="header">
          <h1>🌐 Public URL Shortener</h1>
          <p>Create short links instantly - Perfect for Social Media & Sharing</p>
        </div>
        
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <label htmlFor="url">Enter Website URL *</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              required
            />
            <small>You can enter with or without https://</small>
          </div>
          
          <div className="advanced-section">
            <button 
              type="button" 
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="input-group">
                <label htmlFor="slug">Custom Short Code (Optional)</label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-link"
                  pattern="[a-zA-Z0-9-_]+"
                  title="Only letters, numbers, hyphens and underscores allowed"
                />
                <small>Leave empty for auto-generated code</small>
              </div>
            )}
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '⏳ Creating Short Link...' : '🔗 Create Short Link'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {shortUrl && (
          <div className="result">
            <h3>✅ Your Short Link is Ready!</h3>
            <div className="short-url-container">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
                {shortUrl}
              </a>
              <button onClick={copyToClipboard} className="copy-btn">
                📋 Copy
              </button>
            </div>
            
            <div className="share-buttons">
              <p>Share on:</p>
              <div className="share-buttons-container">
                <button onClick={shareOnFacebook} className="share-btn facebook">
                  📘 Facebook
                </button>
                <button onClick={shareOnTwitter} className="share-btn twitter">
                  🐦 Twitter
                </button>
                <button onClick={copyToClipboard} className="share-btn copy">
                  📋 Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="features">
          <h3>✨ Why Use Our URL Shortener?</h3>
          <div className="feature-grid">
            <div className="feature">
              <span>🌍</span>
              <h4>Public & Free</h4>
              <p>Completely free for everyone to use</p>
            </div>
            <div className="feature">
              <span>📱</span>
              <h4>Social Media Ready</h4>
              <p>Perfect for Facebook, Twitter, Instagram</p>
            </div>
            <div className="feature">
              <span>⚡</span>
              <h4>Instant Redirect</h4>
              <p>No delays, direct to destination</p>
            </div>
            <div className="feature">
              <span>🔒</span>
              <h4>No Registration</h4>
              <p>Start shortening links immediately</p>
            </div>
          </div>
        </div>

        {/* Recent URLs */}
        {urls.length > 0 && (
          <div className="recent-urls">
            <h3>📝 Your Recent Short Links</h3>
            <div className="urls-list">
              {urls.slice(-10).reverse().map((item) => (
                <div key={item.id} className="url-item">
                  <div className="url-info">
                    <a href={item.shortUrl} target="_blank" rel="noopener noreferrer" className="short">
                      {window.location.host}/{item.slug}
                    </a>
                    <span className="clicks">👆 {item.clicks || 0} clicks</span>
                  </div>
                  <div className="original-url" title={item.url}>
                    {item.url.length > 60 ? item.url.substring(0, 60) + '...' : item.url}
                  </div>
                  <div className="url-actions">
                    <button 
                      onClick={() => navigator.clipboard.writeText(item.shortUrl)}
                      className="action-btn copy"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <div className="how-to-use">
          <h3>📖 How to Use</h3>
          <div className="steps">
            <div className="step">
              <span>1</span>
              <p>Enter your long URL above</p>
            </div>
            <div className="step">
              <span>2</span>
              <p>Click "Create Short Link"</p>
            </div>
            <div className="step">
              <span>3</span>
              <p>Copy and share your short link anywhere!</p>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <p>
            <a href="/admin" className="admin-link">🔧 Admin Panel</a>
          </p>
          <p className="footer-note">
            Free Public URL Shortener - Perfect for Social Media Sharing
          </p>
        </div>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 600px;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #fff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .url-form {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          width: 100%;
          margin-bottom: 2rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        small {
          color: #666;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .advanced-section {
          margin-bottom: 1.5rem;
        }

        .advanced-toggle {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.5rem 0;
          font-weight: 600;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #fcc;
          width: 100%;
          text-align: center;
          margin-bottom: 1rem;
        }

        .result {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          width: 100%;
          text-align: center;
          margin-bottom: 2rem;
        }

        .short-url-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .short-url {
          flex: 1;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          word-break: break-all;
          padding: 0.75rem;
          background: #f8f9ff;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }

        .copy-btn {
          padding: 0.75rem 1rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .copy-btn:hover {
          background: #218838;
        }

        .share-buttons {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .share-buttons p {
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .share-buttons-container {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .share-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .share-btn.facebook {
          background: #1877f2;
          color: white;
        }

        .share-btn.twitter {
          background: #1da1f2;
          color: white;
        }

        .share-btn.copy {
          background: #6c757d;
          color: white;
        }

        .share-btn:hover {
          transform: translateY(-1px);
        }

        .features {
          text-align: center;
          color: white;
          width: 100%;
          margin-bottom: 2rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .feature {
          background: rgba(255,255,255,0.1);
          padding: 1.5rem 1rem;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .feature span {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .feature h4 {
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        .feature p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .recent-urls {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          width: 100%;
          margin-bottom: 2rem;
        }

        .recent-urls h3 {
          margin-bottom: 1rem;
          color: #333;
          text-align: center;
        }

        .urls-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .url-item {
          padding: 1rem;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: #f8f9fa;
          position: relative;
        }

        .url-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .url-info .short {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .url-info .clicks {
          font-size: 0.8rem;
          color: #666;
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }

        .original-url {
          font-size: 0.9rem;
          color: #666;
          word-break: break-all;
          margin-bottom: 0.5rem;
        }

        .url-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .action-btn:hover {
          background: #e9ecef;
        }

        .how-to-use {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          width: 100%;
          margin-bottom: 2rem;
        }

        .how-to-use h3 {
          text-align: center;
          margin-bottom: 1rem;
          color: #333;
        }

        .steps {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .step {
          text-align: center;
          flex: 1;
        }

        .step span {
          display: block;
          width: 2rem;
          height: 2rem;
          background: #667eea;
          color: white;
          border-radius: 50%;
          line-height: 2rem;
          margin: 0 auto 0.5rem auto;
          font-weight: bold;
        }

        .step p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        footer {
          padding: 2rem 0;
          color: white;
          text-align: center;
          width: 100%;
        }

        .footer-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .admin-link {
          color: white;
          text-decoration: none;
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          transition: background 0.3s ease;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .admin-link:hover {
          background: rgba(255,255,255,0.3);
        }

        .footer-note {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 0.5rem;
          }
          
          main {
            padding: 1rem 0;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .url-form {
            padding: 1.5rem;
          }
          
          .feature-grid {
            grid-template-columns: 1fr;
          }
          
          .short-url-container {
            flex-direction: column;
          }
          
          .url-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .steps {
            flex-direction: column;
            gap: 1rem;
          }
          
          .share-buttons-container {
            flex-direction: column;
          }
          
          .share-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .feature {
            padding: 1rem 0.5rem;
          }
          
          .feature span {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
