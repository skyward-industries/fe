// IndexNow API for instant Bing/Yahoo indexing
export async function submitToIndexNow(urls: string[]) {
  const indexNowKey = process.env.INDEXNOW_KEY || '1234567890abcdef'; // Generate your own
  
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'skywardparts.com',
        key: indexNowKey,
        keyLocation: `https://skywardparts.com/${indexNowKey}.txt`,
        urlList: urls
      })
    });

    console.log('IndexNow submission:', response.status);
    return response.ok;
  } catch (error) {
    console.error('IndexNow error:', error);
    return false;
  }
}