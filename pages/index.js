import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, slug }),
      })
      
      const data = await response.json()
      if (data.success) {
        setShortUrl(data.shortUrl)
        setUrl('')
        setSlug('')
      } else {
        setError(data.message || 'Error creating short URL')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
    
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    alert('Copied to clipboard!')
  }

  return (
    <div className="container">
      <Head>
        <title>URL Shortener - Short Your Links</title>
        <meta name="description" content="Free URL shortener service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="header">
          <h1>🚀 URL Shortener</h1>
          <p>Shorten your long URLs instantly</p>
        </div>
        
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <label htmlFor="url">Enter Long URL *</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url-path"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="slug">Custom Slug (Optional)</label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-custom-link"
              pattern="[a-zA-Z0-9-_]+"
              title="Only letters, numbers, hyphens and underscores allowed"
            />
            <small>Leave empty for auto-generated slug</small>
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '⏳ Shortening...' : '🔗 Shorten URL'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {shortUrl && (
          <div className="result">
            <h3>✅ Your Short URL:</h3>
            <div className="short-url-container">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
                {shortUrl}
              </a>
              <button onClick={copyToClipboard} className="copy-btn">
                📋 Copy
              </button>
            </div>
            <p className="click-info">Click the link to test it!</p>
          </div>
        )}

        <div className="features">
          <h3>✨ Features</h3>
          <div className="feature-grid">
            <div className="feature">
              <span>⚡</span>
              <p>Instant URL shortening</p>
            </div>
            <div className="feature">
              <span>🔒</span>
              <p>Secure & reliable</p>
            </div>
            <div className="feature">
              <span>📊</span>
              <p>Click tracking</p>
            </div>
            <div className="feature">
              <span>🎯</span>
              <p>Custom slugs</p>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <p>
          <a href="/admin" className="admin-link">🔧 Admin Panel</a>
        </p>
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
          max-width: 500px;
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

        .click-info {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .features {
          text-align: center;
          color: white;
          width: 100%;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .feature {
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .feature span {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        footer {
          padding: 2rem 0;
          color: white;
          text-align: center;
        }

        .admin-link {
          color: white;
          text-decoration: none;
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          transition: background 0.3s ease;
        }

        .admin-link:hover {
          background: rgba(255,255,255,0.3);
        }

        @media (max-width: 600px) {
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
        }
      `}</style>
    </div>
  )
}