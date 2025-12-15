const axios = require('axios');
const cheerio = require('cheerio');

// Regex for extracting emails
// Covers standard format and common obfuscations like [at] or (at)
const EMAIL_REGEX = /([a-zA-Z0-9._-]+(\s*[@]|\[at\]|\(at\))\s*[a-zA-Z0-9._-]+\s*[.]\s*[a-zA-Z0-9._-]+)/gi;

const crawlAndExtract = async (urls) => {
    const results = [];

    for (const url of urls) {
        console.log(`Crawling: ${url}`);
        try {
            const response = await axios.get(url, {
                timeout: 10000, // 10s timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const html = response.data;
            // Convert to string just in case
            const pageContent = typeof html === 'string' ? html : String(html);

            const matches = pageContent.match(EMAIL_REGEX) || [];
            const uniqueEmails = new Set();

            matches.forEach(rawEmail => {
                const normalized = normalizeEmail(rawEmail);
                if (isValidEmail(normalized)) {
                    uniqueEmails.add(normalized);
                }
            });

            if (uniqueEmails.size > 0) {
                uniqueEmails.forEach(email => {
                    results.push({
                        website: new URL(url).hostname,
                        url: url,
                        email: email
                    });
                });
            }

        } catch (error) {
            console.error(`Failed to crawl ${url}:`, error.message);
        }
    }

    return results;
};

const normalizeEmail = (text) => {
    let email = text.toLowerCase();
    email = email.replace(/\s*[@]|\[at\]|\(at\)\s*/g, '@');
    email = email.replace(/\s*[.]|\[dot\]|\(dot\)\s*/g, '.');
    return email.replace(/\s+/g, '');
};

const isValidEmail = (email) => {
    // Basic validation to filter out obvious garbage
    // e.g. image files being matched accidentally or really short strings
    if (email.length < 5 || email.length > 100) return false;
    if (!email.includes('@') || !email.includes('.')) return false;

    // Filter out common false positives (like image extensions if regex was too loose)
    if (email.match(/\.(png|jpg|jpeg|gif|svg|css|js)$/i)) return false;

    return true;
};

module.exports = { crawlAndExtract };
