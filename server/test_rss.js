const Parser = require('rss-parser');
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
});

async function test() {
  const urls = [
    'https://www.barandbench.com/api/feed/rss',
    'https://www.livelaw.in/rss/top-stories',
    'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    'https://www.thehindu.com/news/national/feeder/default.rss',
    'https://rss.app/feeds/tRZ2x5z8aP6sL4kY.xml'
  ];

  for (let url of urls) {
    try {
      const feed = await parser.parseURL(url);
      console.log(`✅ Success: ${url} - Found ${feed.items.length} items. Title: ${feed.title}`);
    } catch (e) {
      console.log(`❌ Failed: ${url} - Error: ${e.message}`);
    }
  }
}
test();
