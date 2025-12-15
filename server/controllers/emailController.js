const searchService = require('../services/searchService');
const crawlerService = require('../services/crawlerService');
const excelService = require('../services/excelService');

const extractEmails = async (req, res) => {
    try {
        const { keywords } = req.body;

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({ error: 'Keywords are required and must be an array.' });
        }

        console.log(`Received request for keywords: ${keywords.join(', ')}`);

        // 1. Search for websites
        const urls = await searchService.searchWeb(keywords);
        console.log(`Found ${urls.length} unique URLs.`);

        if (urls.length === 0) {
            return res.status(404).json({ message: 'No relevant websites found for the given keywords.' });
        }

        // 2. Crawl websites and extract emails
        // We link the results back to the original keywords conceptually, 
        // but since searchService returns a flat list of URLS from ALL keywords,
        // we'll just associate them generally.
        // If strict keyword-to-url mapping is needed, searchService needs refactoring.
        // For now, we'll assign the first keyword to matches found from this batch 
        // or just list "Multiple" or the specific keyword?
        // Actually, let's keep it simple: The Excel has a 'keyword' column.
        // To be accurate, we should probably return { keyword, url } from searchService.
        // For MVP, we will list the main keyword used for the batch if user sent one, 
        // or just leave it generic found. 
        // *Self-Correction*: searchService currently returns just URLs.
        // Let's modify the crawler result mapping to include the searched keyword if possible.
        // Since we are doing a bulk search, we might lose strict tracing without complex logic.
        // Let's just pass the first keyword as "Primary Keyword" effectively or modify search to return metadata.
        // For now, let's assume all results relate to the batch of keywords.

        const extractedData = await crawlerService.crawlAndExtract(urls);
        console.log(`Extracted ${extractedData.length} emails.`);

        if (extractedData.length === 0) {
            return res.status(404).json({ message: 'No emails found on the discovered websites.' });
        }

        // Add back keyword info if missing (crawler returns {website, url, email})
        // We can just join the keywords string for context
        const keywordString = keywords.join(', ');
        const finalData = extractedData.map(item => ({
            ...item,
            keyword: keywordString
        }));

        // 3. Generate Excel
        const buffer = await excelService.generateExcel(finalData);

        // 4. Send response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="emails.xlsx"');
        res.end(buffer);

    } catch (error) {
        console.error('Error in extractEmails controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { extractEmails };
