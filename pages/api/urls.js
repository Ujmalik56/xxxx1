import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  
  try {
    const db = client.db('urlshortener')
    const collection = db.collection('urls')

    if (req.method === 'GET') {
      const urls = await collection.find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      res.status(200).json({
        success: true,
        urls: urls.map(url => ({
          ...url,
          _id: url._id.toString()
        }))
      })
    } 
    else if (req.method === 'DELETE') {
      const { slug } = req.body
      
      if (!slug) {
        return res.status(400).json({ success: false, message: 'Slug is required' })
      }

      const result = await collection.deleteOne({ slug })
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'URL not found' })
      }

      res.status(200).json({ 
        success: true, 
        message: 'URL deleted successfully' 
      })
    } 
    else {
      res.status(405).json({ success: false, message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}