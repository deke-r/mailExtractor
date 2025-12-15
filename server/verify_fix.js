const { searchWeb } = require('./services/searchService');

(async () => {
    try {
        console.log("Starting verification...");
        // Test with a generic keyword
        const urls = await searchWeb(['construction company']);
        console.log(`Found ${urls.length} URLs`);

        if (urls.length > 0) {
            console.log("SUCCESS: URLs found using Bing.");
            urls.slice(0, 3).forEach(u => console.log('Sample:', u));
        } else {
            console.error("FAILURE: No URLs found.");
        }
    } catch (e) {
        console.error('Error in verification:', e);
    }
})();
