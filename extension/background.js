const API_BASE = 'https://facts-chrome-extension.onrender.com';

async function updateImageCache() {
    const storage = await chrome.storage.local.get('imageCache');
    let cache = storage.imageCache || { images: [] };

    // Check if we have enough images in the cache
    // If we do not have enough images in the cache, fetch a new batch
    if (cache.images.length <= 1) {
        // Fetch a batch of images from the proxy server
        const response = await fetch(new URL(`${API_BASE}/api/images`));

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        // Parse the response as JSON
        const data = await response.json();

        if (!data || !data.images || data.images.length === 0) {
            console.error("No images found.");
            return;
        }
        // Create a new imageCache 
        const updatedCache = {
            images: [...cache.images, ...data.images]
        };
        // Cache the images in local storage
        await new Promise(resolve => {
            chrome.storage.local.set({ 'imageCache': updatedCache }, resolve);
        });
        // Make sure the images were saved to the cache
        const updatedStorage = await chrome.storage.local.get('imageCache');
        cache = updatedStorage.imageCache;
        // Check if the cache was updated correctly
        if (!cache || !cache.images || cache.images.length === 0) {
            console.error("No images found in cache after fetching.");
            return;
        }
    }
    // Update the current image in local storage
    updateCurrentImage();
    // Return the new images
    return cache.images;
}

async function updateCurrentImage() {
    const storage = await chrome.storage.local.get('imageCache');
    const cache = storage.imageCache || { images: [] };

    // Select an image from the cache
    const image = cache.images.shift();
    // Update the cache in local storage
    await new Promise(resolve => {
        chrome.storage.local.set({'imageCache': {images: cache.images}}, resolve);
    });

    // Store the current image in local storage separately
    await new Promise(resolve => {
        chrome.storage.local.set({
            currentImage: {
                imageId: image.imageId,
                url: image.url,
                photographer: image.photographer.name,
                photographerUrl: image.photographer.url,
            }
        }, resolve);
    });

    return image;
}

async function updateFactCache() {
    const storage = await chrome.storage.local.get('factCache');
    let cache = storage.factCache || { facts: [] };

    // If we do not have enough fact in the cache, fetch a new batch
    if (cache.facts.length <= 1) {
        // Fetch a batch of images from the proxy server
        const response = await fetch(new URL(`${API_BASE}/api/facts`));
    
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    
        // Parse the response as JSON
        const data = await response.json();
    
        // Create a new factCache 
        const updatedCache = {
            facts: [...cache.facts, ...data.facts]
        };
    
        // Cache the images in local storage
        await new Promise(resolve => {
            chrome.storage.local.set({ 'factCache': updatedCache }, resolve);
        });
    }
    updateCurrentFact();
    // Return the new facts
    return cache.facts;
}

async function updateCurrentFact() {
    const storage = await chrome.storage.local.get('factCache');
    const cache = storage.factCache || { facts: [] };

    // Select an fact from the cache
    const fact = cache.facts.shift();
    // Update the cache in local storage
    await new Promise(resolve => {
        chrome.storage.local.set({
            'factCache': { facts: cache.facts } 
        }, resolve);
    });

    // Store the current fact in local storage separately
    await new Promise(resolve => {
        chrome.storage.local.set({
            currentFact: fact
        }, resolve);
    });
    return fact;
}

chrome.runtime.onInstalled.addListener(() => {
    updateFactCache()
        .then(() => console.log('Fact cache updated on install'))
        .catch(err => console.error('Fact cache update error:', err));

    updateImageCache()
        .then(() => console.log('Image cache updated on install'))
        .catch(err => console.error('Image cache update error:', err));
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'fetchAndCacheData') {
        Promise.all([
            updateImageCache(),
            updateFactCache()
        ])
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(err => {
                console.error('Error fetching and caching data:', err);
                sendResponse({ success: false, error: err.message });
            });
    } else { 
        sendResponse({ success: false, error: 'Unknown action' });
    }
    return true;
});