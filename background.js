function fetchAndCacheImages() {
    const response = fetch('https://localhost:3000/api/images');
}

chrome.runtime.onInstalled.addListener(() => {
    // Fetch and cache the image when the extension is installed
    fetchAndCacheImages();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'fetchNewImages') {
        fetchAndCacheImages();
    }
});