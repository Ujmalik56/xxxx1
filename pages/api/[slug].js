import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' })
    }

    const client = await clientPromise
    const db = client.db('urlshortener')
    const collection = db.collection('urls')

    // Find the URL
    const urlDoc = await collection.findOne({ slug })

    if (!urlDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'Short URL not found' 
      })
    }

    // Update click count
    await collection.updateOne(
      { slug },
      { $inc: { clicks: 1 } }
    )

    // Redirect to the original URL
    res.redirect(302, urlDoc.url)

  } catch (error) {
    console.error('Error redirecting:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
}