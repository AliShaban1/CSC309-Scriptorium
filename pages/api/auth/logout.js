let blacklistedTokens = []

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      // Add the token to the blacklist
      blacklistedTokens.push(token);
      console.log('Token invalidated:', token);

      return res.status(200).json({ message: 'Logout successful. Token invalidated.' });
    } catch (error) {
      console.error('Error invalidating token:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}