const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/news/sc-judgments
router.get('/sc-judgments', authMiddleware, async (req, res) => {
  try {
    // Fetch Google News RSS for Supreme Court India (Last 7 days)
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=Supreme+Court+India+when:7d&hl=en-IN&gl=IN&ceid=IN:en');
    
    // Format the items
    const newsItems = feed.items.map(item => {
      // Google News titles usually look like "Headline - Publisher Name"
      const parts = item.title.split(' - ');
      const publisher = parts.length > 1 ? parts.pop() : 'Google News';
      const cleanTitle = parts.join(' - ');

      return {
        title: cleanTitle,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: '', // Google News descriptions are HTML snippets, we'll keep it simple
        source: publisher
      };
    }).slice(0, 5); // Just grab the top 5

    res.json({ success: true, news: newsItems });
  } catch (error) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch latest legal news' });
  }
});

module.exports = router;
