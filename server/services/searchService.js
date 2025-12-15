const axios = require('axios');
const cheerio = require('cheerio');

const BLOCKED_DOMAINS = [
    'facebook.com', 'linkedin.com', 'instagram.com', 'twitter.com', 'youtube.com',
    'pinterest.com', 'reddit.com', 'amazon.com', 'yelp.com', 'tripadvisor.com',
    'indiamart.com', 'justdial.com', 'sulekha.com', 'quora.com'
];

const searchWeb = async (keywords) => {
    let allUrls = new Set();

    for (const keyword of keywords) {
        console.log(`Searching for: ${keyword}`);
        try {
            const response = await axios.get('https://html.duckduckgo.com/html/', {
                params: { q: keyword },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Select results using known DuckDuckGo HTML selectors
            $('.result__a').each((i, el) => {
                const url = $(el).attr('href');
                if (url) {
                    // DuckDuckGo redirect URLs need decoding (sometimes they are direct, sometimes not)
                    // The HTML version usually gives direct links or links with /l/?kh=-1&uddg=...
                    // But actually .result__a in html.duckduckgo often points to the relative redirect handler
                    // However, usually we can get the actual URL from the text or decode the href

                    let actualUrl = url;
                    try {
                        const urlObj = new URL(url, 'https://duckduckgo.com');
                        if (urlObj.pathname === '/l/') {
                            actualUrl = urlObj.searchParams.get('uddg');
                        }
                    } catch (e) {
                        // ignore invalid urls
                    }

                    if (actualUrl && actualUrl.startsWith('http')) {
                        if (isRelevant(actualUrl)) {
                            allUrls.add(actualUrl);
                        }
                    }
                }
            });

        } catch (error) {
            console.error(`Error searching for ${keyword}:`, error.message);
        }
    }

    return Array.from(allUrls);
};

const isRelevant = (url) => {
    try {
        const hostname = new URL(url).hostname;
        return !BLOCKED_DOMAINS.some(domain => hostname.includes(domain));
    } catch (e) {
        return false;
    }
};

module.exports = { searchWeb };
