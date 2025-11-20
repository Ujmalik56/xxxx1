import clientPromise from '../../lib/mongodb'
import { customAlphabet } from 'nanoid'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 6)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { url, slug } = req.body
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid URL format' })
    }

    const client = await clientPromise
    const db = client.db('urlshortener')
    const collection = db.collection('urls')

    let finalSlug = slug || nanoid()

    // Validate slug format
    if (finalSlug && !/^[a-zA-Z0-9-_]+$/.test(finalSlug)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug can only contain letters, numbers, hyphens and underscores' 
      })
    }

    // Check if slug already exists
    const existing = await collection.findOne({ slug: finalSlug })
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug already exists. Please choose a different one.' 
      })
    }

    // Insert into database
    await collection.insertOne({
      url,
      slug: finalSlug,
      clicks: 0,
      createdAt: new Date()
    })

    const shortUrl = `${process.env.NEXTAUTH_URL || 'https://xxxx1.vercel.app'}/${finalSlug}`

    res.status(200).json({
      success: true,
      slug: finalSlug,
      shortUrl: shortUrl,
      message: 'URL shortened successfully!'
    })

  } catch (error) {
    console.error('Error creating short URL:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again.' 
    })
  }
}