const axios = require('axios');

const BLOCKED_DOMAINS = [
    'facebook.com', 'linkedin.com', 'instagram.com', 'twitter.com', 'youtube.com',
    'pinterest.com', 'reddit.com', 'amazon.com', 'yelp.com', 'tripadvisor.com',
    'indiamart.com', 'justdial.com', 'sulekha.com', 'quora.com'
];

/**
 * Search for websites using Google Custom Search JSON API
 * Free tier: 100 queries/day
 * Setup instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable "Custom Search API"
 * 4. Create credentials (API Key)
 * 5. Go to https://programmablesearchengine.google.com/
 * 6. Create a new search engine (search the entire web)
 * 7. Get the Search Engine ID
 * 8. Add to .env: GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID
 */
const searchWeb = async (keywords) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    // Fallback: If no API keys, use a predefined list approach
    if (!apiKey || !searchEngineId) {
        console.warn('⚠️  Google API credentials not found in .env file');
        console.warn('⚠️  Using fallback method with limited results');
        return await fallbackSearch(keywords);
    }

    let allUrls = new Set();

    for (const keyword of keywords) {
        console.log(`🔍 Searching Google for: ${keyword}`);
        try {
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: apiKey,
                    cx: searchEngineId,
                    q: keyword,
                    num: 10 // Get top 10 results per keyword
                },
                timeout: 15000
            });

            if (response.data.items && response.data.items.length > 0) {
                console.log(`✅ Found ${response.data.items.length} results from Google for '${keyword}'`);

                response.data.items.forEach(item => {
                    const url = item.link;
                    if (url && url.startsWith('http')) {
                        if (isRelevant(url)) {
                            allUrls.add(url);
                        }
                    }
                });
            } else {
                console.log(`⚠️  No results found for '${keyword}'`);
            }

            // Add small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`❌ Error searching Google for ${keyword}:`, error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Error details:`, error.response.data);
            }
        }
    }

    console.log(`📊 Total unique URLs found: ${allUrls.size}`);
    return Array.from(allUrls);
};

/**
 * Fallback search when Google API is not configured
 * Uses a simple keyword-to-domain mapping for common industries
 */
const fallbackSearch = async (keywords) => {
    console.log('🔄 Using fallback search method...');
    const urls = new Set();

    // Simple keyword-based URL generation
    // This is a basic approach - in production, you'd want a more sophisticated method
    for (const keyword of keywords) {
        const searchTerm = keyword.toLowerCase().replace(/\s+/g, '-');

        // Generate some potential URLs based on common patterns
        const potentialUrls = [
            `https://www.${searchTerm}.com`,
            `https://www.${searchTerm}.in`,
            `https://${searchTerm}.com`,
            `https://${searchTerm}.org`
        ];

        // Try to verify if these URLs exist
        for (const url of potentialUrls) {
            try {
                const response = await axios.head(url, {
                    timeout: 5000,
                    maxRedirects: 5,
                    validateStatus: (status) => status < 500
                });

                if (response.status === 200) {
                    console.log(`✅ Found valid URL: ${url}`);
                    urls.add(url);
                }
            } catch (error) {
                // URL doesn't exist or is not accessible, skip it
            }
        }
    }

    if (urls.size === 0) {
        console.warn('⚠️  Fallback search found no valid URLs');
        console.warn('⚠️  Please configure Google Custom Search API for better results');
        console.warn('⚠️  See searchService.js for setup instructions');
    }

    return Array.from(urls);
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
