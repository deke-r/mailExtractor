const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const debugSearch = async () => {
    const keyword = 'construction company';
    console.log(`Searching for: ${keyword} on Bing`);
    try {
        const response = await axios.get('https://www.bing.com/search', {
            params: { q: keyword },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'SRCHHPGUSR=SRCHLANG=en' // Enforce English
            }
        });

        console.log(`Bing Response Status: ${response.status}`);
        fs.writeFileSync('debug_response_bing.html', response.data);
        console.log('Saved response to debug_response_bing.html');

        const $ = cheerio.load(response.data);
        // Bing results usually in li.b_algo h2 a
        const resultCount = $('li.b_algo h2 a').length;
        console.log(`Found ${resultCount} raw results`);

        $('li.b_algo h2 a').each((i, el) => {
            console.log("Found URL:", $(el).attr('href'));
        });

    } catch (e) {
        console.error(e);
        if (e.response) {
            console.log("Status:", e.response.status);
        }
    }
};

debugSearch();
