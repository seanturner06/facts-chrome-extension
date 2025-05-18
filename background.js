const API_BASE = 'https://facts-chrome-extension.onrender.com';

async function fetchAndCacheImages() {

    // If we do not have enough images in the cache, fetch a new batch 
    const storage = await chrome.storage.local.get('imageCache');
    let cache = storage.imageCache || { images: [] };

    // If we already have enough images, do not fetch new ones
    if(cache.images.length >= 1){
        console.log(`Already have ${cache.images.length} images in cache`);
        return cache.images;
    }

    console.log(`Fetching new images...`);

    // Fetch a batch of images from the proxy server
    const response = await fetch(new URL(`${API_BASE}/api/images`));

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
    await new Promise(resolve => {
        chrome.storage.local.set({'imageCache': updatedCache}, resolve);
    });
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
    await new Promise(resolve => {
        chrome.storage.local.set({
        'imageCache': {
            ...cache, 
            images: cache.images
            },
        }, resolve);
    }); 

    // Store the current image in local storage separately
    await new Promise( resolve => {
        chrome.storage.local.set({
        currentImage:{
            imageId: image.imageId, 
            url: image.url, 
            photographer: image.photographer.name,
            photographerUrl: image.photographer.url,
            }
        }, resolve);
    });

    return image;
}

async function fetchAndCacheFacts() {
    // If we do not have enough images in the cache, fetch a new batch 
    const storage = await chrome.storage.local.get('factCache');
    let cache = storage.factCache || { facts: [] };

    // If we already have enough images, do not fetch new ones
    if(cache.facts.length >= 5){
        console.log(`Already have ${cache.facts.length} facts in cache`);
        return cache.facts;
    }

    console.log(`Fetching new facts...`);

    // Fetch a batch of images from the proxy server
    const response = await fetch(new URL(`${API_BASE}/api/facts`));

    if(!response.ok){
        throw new Error(`Server responded with status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();

    // Create a new factCache 
    const updatedCache = {
        facts: [...cache.facts, ...data.facts], 
        lastUpdated: Date.now()
    };
    
    // Cache the images in local storage
    await new Promise(resolve => {
        chrome.storage.local.set({'factCache': updatedCache}, resolve); 
    });
    console.log(`Successfully cached ${data.facts.length} facts`);
    // Return the new facts
    return updatedCache.facts;
}

async function updateFactCache() {
    const storage = await chrome.storage.local.get('factCache');
    let cache = storage.factCache || { facts: [] };

    // If we do not have enough fact in the cache, fetch a new batch
    if(cache.facts.length <= 1){
        console.log("Fetching new facts...");
        await fetchAndCacheFacts();

        const updatedStorage = await chrome.storage.local.get('factCache'); 
        cache = updatedStorage.factCache;

        if(!cache || !cache.facts || cache.facts.length === 0) {
            console.error("No facts found in cache after fetching.");
            return;
        }
    }

    // Select an fact from the cache
    const fact = cache.facts.shift();
    // Update the cache in local storage
    await new Promise(resolve => {
        chrome.storage.local.set({
        'factCache': {
            ...cache, 
            facts: cache.facts
        }
    }
    , resolve);
    });

    // Store the current fact in local storage separately
    await new Promise(resolve => {
        chrome.storage.local.set({
        currentFact: fact
    },
        resolve);
    });

    return fact;
}

chrome.runtime.onInstalled.addListener(async () => {
    // Fetch and cache the image when the extension is installed
    await Promise.all([
        fetchAndCacheImages(),
        fetchAndCacheFacts()
    ]);

    await Promise.all([
        updateFactCache(),
        updateImageCache()
    ]);
    console.log('Extension installed and caches updated');
});

chrome.runtime.onStartup.addListener(async () => {
    await Promise.all([
        updateFactCache(),
        updateImageCache()
    ]);
    console.log('Extension started and caches updated');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'fetchAndCacheData') {
        Promise.all([
            updateImageCache(), 
            updateFactCache()
        ])
        .then(()=>{
            console.log('Data fetched and cached');
            sendResponse({ success: true });
        })
        .catch(err => {
            console.error('Error fetching and caching data:', err);
            sendResponse({ success: false, error: err.message });
        });
    }else{
        console.log('Unknown message action:', msg.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
    return true;
});