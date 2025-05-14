async function fetchAndCacheImages() {

    // If we do not have enough images in the cache, fetch a new batch 
    const storage = await chrome.storage.local.get('imageCache');
    let cache = storage.imageCache || { images: [] };

    // If we already have enough images, do not fetch new ones
    if(cache.images.length >= 10){
        console.log(`Already have ${cache.images.length} images in cache`);
        return cache.images;
    }

    console.log(`Fetching new images...`);

    // Fetch a batch of images from the proxy server
    const response = await fetch('http://localhost:3000/api/images');

    if(!response.ok){
        throw new Error(`Server responded with status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();

    // Create a new imageCache 
    const updatedCache = {
        images: [...cache.images, ...data.images], 
        lastUpdated: Date.now()
    };
    
    // Cache the images in local storage
    await chrome.storage.local.set({'imageCache': updatedCache});
    console.log(`Successfully cached ${data.images.length} images`);
    // Return the new images
    return updatedCache.images;
}

async function updateImageCache(){
    const storage = await chrome.storage.local.get('imageCache');
    let cache = storage.imageCache || { images: [] };

    // If we do not have enough images in the cache, fetch a new batch
    if(cache.images.length <= 1){
        console.log("Fetching new images...");
        await fetchAndCacheImages();

        const updatedStorage = await chrome.storage.local.get('imageCache'); 
        cache = updatedStorage.imageCache; 

        if(!cache || !cache.images || cache.images.length === 0) {
            console.error("No images found in cache after fetching.");
            return;
        }
    }

    // Select an image from the cache
    const image = cache.images.shift();
    // Update the cache in local storage
    await chrome.storage.local.set({
        'imageCache': {
            ...cache, 
            images: cache.images
        }
    });

    // Store the current image in local storage separately
    await chrome.storage.local.set({
        currentImage:{
            imageId: image.imageId, 
            url: image.url, 
            photographer: image.photographer.name,
            photographerUrl: image.photographer.url,
        }
    });

    return image;
}

chrome.runtime.onInstalled.addListener(async () => {
    // Fetch and cache the image when the extension is installed
    await fetchAndCacheImages();
});

chrome.runtime.onStartup.addListener(async () => {
    await updateImageCache();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'fetchImage') {
        updateImageCache().then(() => {
            sendResponse({ success: true });
        })
        .catch(error => {
            console.error('Error fetching image:', error);
            sendResponse({ success: false, error: error.message });
        });
    }
    return true;
});