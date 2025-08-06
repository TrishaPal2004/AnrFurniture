// api/hero.js
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching hero data from backend...');
    
    const response = await fetch("https://anrfurniture-2.onrender.com/api/hero", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hero data fetched successfully');

    // Set cache headers for Vercel Edge Network
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=3600');
    
    // Return the cached data
    res.status(200).json(data);

  } catch (error) {
    console.error('Hero API Error:', error);
    
    // Return error response
    res.status(500).json({ 
      error: 'Failed to fetch hero data',
      message: error.message 
    });
  }
}