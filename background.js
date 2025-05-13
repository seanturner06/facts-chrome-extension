async function fetchAndCacheImages() {
    const response = await fetch('https://localhost:3000/api/images');

    if(!response.ok){
        throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the images in local storage
    await chrome.storage.local.set({'cachedImages': data.images});
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