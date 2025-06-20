document.addEventListener('DOMContentLoaded', () => { 

    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        
            const searchTerm = e.target.value.trim();
            if (searchTerm) {
                chrome.search.query({
                    text: searchTerm,
                    disposition: "CURRENT_TAB"
                });
            }
        }
    });

    document.getElementById('searchIcon').addEventListener('click', () => {
        searchTerm = document.getElementById('searchInput').value.trim(); 

        if (searchTerm) {
            chrome.search.query({
                text: searchTerm,
                disposition: "CURRENT_TAB"
            });
        }
    });

    window.addEventListener('pageshow', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        } 
    });
    
    // Show loading state initially
    document.body.style.backgroundColor = '#333';
    const factContainer = document.getElementById('fact-container');
    if (factContainer) {
        factContainer.textContent = 'Loading amazing content...';
    }
        
        // Fetch both image and fact in a single storage call
        chrome.storage.local.get(['currentImage', 'currentFact'], (result) => {
            
            // Handle the image
            if (result && result.currentImage && result.currentImage.url) {
                document.body.style.backgroundImage = `url('${result.currentImage.url}')`;
                
                const authorLink = document.getElementById('author'); 
                if (authorLink) {
                    if (result.currentImage.photographer) {
                        authorLink.textContent = result.currentImage.photographer;
                    } else {
                        authorLink.textContent = 'Unknown Photographer';
                    }
                    
                    if (result.currentImage.photographerUrl) {
                        authorLink.href = `${result.currentImage.photographerUrl}?utm_source=tabflux&utm_medium=referral`;
                    } else {
                        authorLink.href = '#'; // fallback link
                    }
                }
                
                // Image color processing - with defensive checks
                try {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.onerror = (error) => {
                        console.error('Error loading image for processing:', error);
                    };
                    
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = 5;
                            canvas.height = 5;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, 5, 5);
                            const imageData = ctx.getImageData(0, 0, 5, 5).data;
                            let r = 0, g = 0, b = 0;
                            let count = 0; 
                            for (let i = 0; i < imageData.length; i += 4) {
                                r += imageData[i];
                                g += imageData[i + 1];
                                b += imageData[i + 2];
                                count++;
                            }
                            r = Math.round(r / count);
                            g = Math.round(g / count);
                            b = Math.round(b / count);
                            // Calculate luminance (better than simple brightness)
                            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    
                            if (factContainer) {
                                if (luminance > 0.5) {
                                    // Light color - use it for text on dark background
                                    factContainer.style.color = `rgb(${r}, ${g}, ${b})`;
                                    factContainer.style.backgroundColor = `rgba(0, 0, 0, 0.8)`;
                                } else {
                                    // Dark color - use it for text on light background
                                    factContainer.style.color = `rgb(${r}, ${g}, ${b})`;
                                    factContainer.style.backgroundColor = `rgba(255, 255, 255, 0.8)`;
                                }
                            }
                        } catch (colorError) {
                            console.error('Error processing image colors:', colorError);
                        }
                    };
                    
                    // Set src AFTER setting up event handlers
                    img.src = result.currentImage.url;
                } catch (imgError) {
                    console.error('Error in image processing setup:', imgError);
                }
            } else {
                console.warn('No valid image found in storage');
                document.body.style.backgroundColor = '#333'; // fallback color
                
                const authorLink = document.getElementById('author');
                if (authorLink) {
                    authorLink.textContent = 'Unknown Photographer';
                    authorLink.href = '#';
                }
            }
            
            // Handle the fact - directly within the same callback
            if (result && result.currentFact && result.currentFact.fact) {
                if (factContainer) {
                    // typeEffect(factContainer, result.currentFact.fact, 25);
                    factContainer.textContent = result.currentFact.fact; 
                }
            } else {
                console.warn('No valid fact found in storage');
                if (factContainer) {
                    factContainer.textContent = 'Welcome to Facts Extension!';
                }
            }
        });

        // Trigger background to fetch new content for next time
        chrome.runtime.sendMessage({ action: 'fetchAndCacheData' });
});