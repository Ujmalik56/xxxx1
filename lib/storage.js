// Server-side compatible storage solution
export class URLStorage {
  constructor() {
    this.key = 'shortenedUrls'
  }

  // Get URLs from localStorage (client-side) or empty array (server-side)
  getURLs() {
    if (typeof window === 'undefined') {
      return []
    }
    
    try {
      const stored = localStorage.getItem(this.key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading from storage:', error)
      return []
    }
  }

  // Save URLs to localStorage
  saveURLs(urls) {
    if (typeof window === 'undefined') {
      return false
    }
    
    try {
      localStorage.setItem(this.key, JSON.stringify(urls))
      return true
    } catch (error) {
      console.error('Error saving to storage:', error)
      return false
    }
  }

  // Find URL by slug
  findURLBySlug(slug) {
    const urls = this.getURLs()
    return urls.find(url => url.slug === slug)
  }

  // Add new URL
  addURL(urlData) {
    const urls = this.getURLs()
    const newURL = {
      id: Date.now().toString(),
      ...urlData,
      createdAt: new Date().toISOString(),
      clicks: 0
    }
    
    urls.push(newURL)
    this.saveURLs(urls)
    return newURL
  }

  // Update URL clicks
  incrementClicks(slug) {
    const urls = this.getURLs()
    const updatedURLs = urls.map(url => 
      url.slug === slug 
        ? { ...url, clicks: (url.clicks || 0) + 1 }
        : url
    )
    return this.saveURLs(updatedURLs)
  }

  // Update URL
  updateURL(id, updates) {
    const urls = this.getURLs()
    const updatedURLs = urls.map(url => 
      url.id === id 
        ? { ...url, ...updates }
        : url
    )
    return this.saveURLs(updatedURLs)
  }

  // Delete URL
  deleteURL(id) {
    const urls = this.getURLs()
    const updatedURLs = urls.filter(url => url.id !== id)
    return this.saveURLs(updatedURLs)
  }

  // Delete all URLs
  deleteAllURLs() {
    return this.saveURLs([])
  }
}

export const urlStorage = new URLStorage()
