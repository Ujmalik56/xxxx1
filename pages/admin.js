import { useState, useEffect } from 'react'
import Head from 'next/head'

// Admin Credentials - Change these as per your requirement
const ADMIN_CREDENTIALS = [
  { email: 'umairatta307@gmail.com', password: 'JOYIA786@#$JOYIA' }
  // Add more admin emails and passwords here
]

export default function Admin() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({ total: 0, totalClicks: 0 })
  const [editingUrl, setEditingUrl] = useState(null)
  const [newSlug, setNewSlug] = useState('')
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadUrls()
    }
  }, [])

  const loadUrls = () => {
    setLoading(true)
    try {
      const savedUrls = localStorage.getItem('shortenedUrls')
      const urlsData = savedUrls ? JSON.parse(savedUrls) : []
      setUrls(urlsData)
      
      // Calculate stats
      const total = urlsData.length
      const totalClicks = urlsData.reduce((sum, url) => sum + url.clicks, 0)
      setStats({ total, totalClicks })
    } catch (error) {
      console.error('Error loading URLs:', error)
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Check if credentials match any admin
    const isValidAdmin = ADMIN_CREDENTIALS.some(
      admin => admin.email === email && admin.password === password
    )

    if (isValidAdmin) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminEmail', email)
      loadUrls()
    } else {
      alert('❌ Invalid admin credentials!')
    }
  }

  const handleDelete = (id) => {
    if (confirm('⚠️ Are you sure you want to delete this URL?')) {
      try {
        const updatedUrls = urls.filter(url => url.id !== id)
        setUrls(updatedUrls)
        localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls))
        
        // Update stats
        const deletedUrl = urls.find(url => url.id === id)
        setStats(prev => ({
          total: prev.total - 1,
          totalClicks: prev.totalClicks - (deletedUrl?.clicks || 0)
        }))
        
        alert('✅ URL deleted successfully!')
      } catch (error) {
        alert('❌ Error deleting URL')
      }
    }
  }

  const startEditing = (url) => {
    setEditingUrl(url)
    setNewSlug(url.slug)
    setNewUrl(url.url)
  }

  const cancelEditing = () => {
    setEditingUrl(null)
    setNewSlug('')
    setNewUrl('')
  }

  const handleUpdate = () => {
    if (!newSlug || !newUrl) {
      alert('❌ Slug and URL are required!')
      return
    }

    // Check if new slug already exists (excluding current URL)
    const slugExists = urls.some(url => 
      url.slug === newSlug && url.id !== editingUrl.id
    )

    if (slugExists) {
      alert('❌ This slug is already taken!')
      return
    }

    try {
      const updatedUrls = urls.map(url => 
        url.id === editingUrl.id 
          ? { 
              ...url, 
              slug: newSlug,
              url: newUrl,
              shortUrl: `${window.location.origin}/${newSlug}`
            }
          : url
      )

      setUrls(updatedUrls)
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls))
      setEditingUrl(null)
      setNewSlug('')
      setNewUrl('')
      
      alert('✅ URL updated successfully!')
    } catch (error) {
      alert('❌ Error updating URL')
    }
  }

  const handleDeleteAll = () => {
    if (confirm('⚠️ Are you sure you want to delete ALL URLs? This action cannot be undone.')) {
      try {
        setUrls([])
        localStorage.setItem('shortenedUrls', JSON.stringify([]))
        setStats({ total: 0, totalClicks: 0 })
        alert('✅ All URLs deleted successfully!')
      } catch (error) {
        alert('❌ Error deleting URLs')
      }
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setEmail('')
    setPassword('')
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminEmail')
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
            <p className="login-info">Only authorized administrators can access this panel</p>
            
            <div className="input-group">
              <label>Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
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
              🔑 Login to Admin Panel
            </button>

            <div className="demo-accounts">
              <h4>Demo Admin Accounts:</h4>
              {ADMIN_CREDENTIALS.map((admin, index) => (
                <div key={index} className="demo-account">
                  <strong>Email:</strong> {admin.email} | <strong>Password:</strong> {admin.password}
                </div>
              ))}
            </div>
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
            max-width: 500px;
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
            margin-bottom: 1.5rem;
          }

          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }

          .demo-accounts {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #e1e5e9;
          }

          .demo-accounts h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 0.9rem;
          }

          .demo-account {
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 0.25rem;
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
          <div className="header-left">
            <h1>🔧 Admin Panel</h1>
            <span className="admin-email">
              Logged in as: {localStorage.getItem('adminEmail')}
            </span>
          </div>
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
          <div className="header-actions">
            <button onClick={handleDeleteAll} className="delete-all-btn">
              🗑️ Delete All
            </button>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {loading ? (
          <div className="loading">⏳ Loading URLs...</div>
        ) : (
          <div className="urls-section">
            <h2>📊 All Short URLs ({urls.length})</h2>
            
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
                      <tr key={url.id}>
                        <td className="short-url-cell">
                          {editingUrl?.id === url.id ? (
                            <input
                              type="text"
                              value={newSlug}
                              onChange={(e) => setNewSlug(e.target.value)}
                              className="edit-input"
                              placeholder="Enter new slug"
                            />
                          ) : (
                            <>
                              <a 
                                href={url.shortUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="short-url"
                              >
                                {url.slug}
                              </a>
                              <button 
                                onClick={() => copyToClipboard(url.shortUrl)}
                                className="icon-btn"
                                title="Copy short URL"
                              >
                                📋
                              </button>
                            </>
                          )}
                        </td>
                        <td className="original-url">
                          {editingUrl?.id === url.id ? (
                            <input
                              type="url"
                              value={newUrl}
                              onChange={(e) => setNewUrl(e.target.value)}
                              className="edit-input"
                              placeholder="Enter new URL"
                            />
                          ) : (
                            <>
                              <span title={url.url}>
                                {url.url.length > 40 ? url.url.substring(0, 40) + '...' : url.url}
                              </span>
                              <button 
                                onClick={() => copyToClipboard(url.url)}
                                className="icon-btn"
                                title="Copy original URL"
                              >
                                📋
                              </button>
                            </>
                          )}
                        </td>
                        <td className="clicks">
                          <span className="clicks-badge">{url.clicks}</span>
                        </td>
                        <td className="created-date">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="actions">
                          {editingUrl?.id === url.id ? (
                            <div className="edit-actions">
                              <button 
                                onClick={handleUpdate}
                                className="save-btn"
                              >
                                💾
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="cancel-btn"
                              >
                                ❌
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                onClick={() => startEditing(url)}
                                className="edit-btn"
                                title="Edit URL"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDelete(url.id)}
                                className="delete-btn"
                                title="Delete URL"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
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

        .header-left {
          display: flex;
          flex-direction: column;
        }

        h1 {
          color: #333;
          margin: 0;
        }

        .admin-email {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
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

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .delete-all-btn {
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .delete-all-btn:hover {
          background: #ff5252;
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
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }

        .edit-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          width: 100%;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;
          font-size: 0.9rem;
        }

        .icon-btn:hover {
          background: #f8f9fa;
        }

        .clicks-badge {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .created-date {
          color: #666;
          white-space: nowrap;
        }

        .actions {
          min-width: 120px;
        }

        .edit-actions, .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .save-btn, .cancel-btn, .delete-btn {
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
          font-size: 0.9rem;
        }

        .edit-btn {
          background: #ffc107;
          color: white;
        }

        .edit-btn:hover {
          background: #e0a800;
        }

        .save-btn {
          background: #28a745;
          color: white;
        }

        .save-btn:hover {
          background: #218838;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
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
          
          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .header-actions button {
            width: 100%;
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
