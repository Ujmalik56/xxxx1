import { useState, useEffect } from 'react'
import Head from 'next/head'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123456'

export default function Admin() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({ total: 0, totalClicks: 0 })

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchUrls()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls')
      const data = await response.json()
      if (data.success) {
        setUrls(data.urls)
        
        // Calculate stats
        const total = data.urls.length
        const totalClicks = data.urls.reduce((sum, url) => sum + url.clicks, 0)
        setStats({ total, totalClicks })
      }
    } catch (error) {
      console.error('Error fetching URLs:', error)
      alert('Error loading URLs')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      fetchUrls()
    } else {
      alert('❌ Invalid credentials!')
    }
  }

  const handleDelete = async (slug) => {
    if (confirm('⚠️ Are you sure you want to delete this URL?')) {
      try {
        const response = await fetch('/api/urls', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
        })
        
        const data = await response.json()
        if (data.success) {
          setUrls(urls.filter(url => url.slug !== slug))
          setStats(prev => ({
            total: prev.total - 1,
            totalClicks: prev.totalClicks - urls.find(u => u.slug === slug)?.clicks || 0
          }))
          alert('✅ URL deleted successfully!')
        }
      } catch (error) {
        alert('❌ Error deleting URL')
      }
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
    localStorage.removeItem('adminAuth')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('📋 Copied to clipboard!')
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <Head>
          <title>Admin Login - URL Shortener</title>
        </Head>
        
        <div className="login-container">
          <form onSubmit={handleLogin} className="login-form">
            <h2>🔐 Admin Login</h2>
            <p className="login-info">Only authorized personnel can access this panel</p>
            
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button type="submit" className="login-btn">
              🔑 Login
            </button>
          </form>
        </div>

        <style jsx>{`
          .admin-login {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 1rem;
          }

          .login-container {
            width: 100%;
            max-width: 400px;
          }

          .login-form {
            background: white;
            padding: 2.5rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }

          h2 {
            text-align: center;
            margin-bottom: 0.5rem;
            color: #333;
          }

          .login-info {
            text-align: center;
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
          }

          .input-group {
            margin-bottom: 1.5rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
          }

          input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
          }

          input:focus {
            outline: none;
            border-color: #667eea;
          }

          .login-btn {
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

          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <Head>
        <title>Admin Panel - URL Shortener</title>
      </Head>

      <header className="admin-header">
        <div className="header-content">
          <h1>🔧 Admin Panel</h1>
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total URLs</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.totalClicks}</span>
              <span className="stat-label">Total Clicks</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        {loading ? (
          <div className="loading">⏳ Loading URLs...</div>
        ) : (
          <div className="urls-section">
            <h2>📊 All Short URLs</h2>
            
            {urls.length === 0 ? (
              <div className="empty-state">
                <p>No URLs found. Start shortening some URLs!</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="urls-table">
                  <thead>
                    <tr>
                      <th>Short URL</th>
                      <th>Original URL</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map((url) => (
                      <tr key={url._id}>
                        <td className="short-url-cell">
                          <a 
                            href={`/${url.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="short-url"
                          >
                            {url.slug}
                          </a>
                          <button 
                            onClick={() => copyToClipboard(`${window.location.origin}/${url.slug}`)}
                            className="icon-btn"
                            title="Copy short URL"
                          >
                            📋
                          </button>
                        </td>
                        <td className="original-url">
                          <span title={url.url}>{url.url}</span>
                          <button 
                            onClick={() => copyToClipboard(url.url)}
                            className="icon-btn"
                            title="Copy original URL"
                          >
                            📋
                          </button>
                        </td>
                        <td className="clicks">
                          <span className="clicks-badge">{url.clicks}</span>
                        </td>
                        <td className="created-date">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="actions">
                          <button 
                            onClick={() => handleDelete(url.slug)}
                            className="delete-btn"
                            title="Delete URL"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-header {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 1rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        h1 {
          color: #333;
          margin: 0;
        }

        .stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
          text-transform: uppercase;
        }

        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .logout-btn:hover {
          background: #c82333;
        }

        .admin-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.2rem;
        }

        .urls-section h2 {
          color: #333;
          margin-bottom: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 10px;
          color: #666;
        }

        .table-container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .urls-table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e9ecef;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .short-url-cell, .original-url {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .short-url {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .short-url:hover {
          text-decoration: underline;
        }

        .original-url span {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .icon-btn:hover {
          background: #f8f9fa;
        }

        .clicks-badge {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .created-date {
          color: #666;
          white-space: nowrap;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.3s ease;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .stats {
            gap: 1rem;
          }
          
          .admin-main {
            padding: 1rem;
          }
          
          .table-container {
            overflow-x: auto;
          }
          
          .urls-table {
            min-width: 800px;
          }
          
          td, th {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}