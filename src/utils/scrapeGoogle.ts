import axios from 'axios';
import cheerio from 'cheerio';

/**
 * Scrape Google search results for a given query.
 * @param {string} query - The search term.
 * @returns {Promise<Array<{title: string, link: string, snippet: string}>>}
 */
export async function scrapeGoogle(query: string): Promise<Array<{ title: string; link: string; snippet: string }>> {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    });

    const $ = cheerio.load(data);
    const results: Array<{ title: string; link: string; snippet: string }> = [];

    // Use 'any' for element type for compatibility across cheerio versions
    $('div.g').each((i: number, el: any) => {
        const title = $(el).find('h3').text();
        const link = $(el).find('a').attr('href');
        const snippet = $(el).find('.VwiC3b').text();
        if (title && link) {
            results.push({ title, link, snippet });
        }
    });

    return results;
}