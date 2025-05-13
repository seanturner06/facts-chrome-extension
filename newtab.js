const width = window.innerWidth;
const height = window.innerHeight;

// Function to add dynamic typing effect
function typeEffect(element, text, speed, callback=null){
    let index = 0;

    // Make sure the element is empty before starting
    element.textContent = '';

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            if (callback) callback();
        }
    }
    type();
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch a random image from local storage
    chrome.storage.local.get('currentImage', (result) => {
        if (result.currentImage) {
            document.body.style.backgroundImage = `url('${result.currentImage.url}')`;
        } else {
          document.body.style.backgroundColor = '#333'; // fallback color
        }

        const authorLink = document.getElementById('author'); 
        authorLink.textContent = result.currentImage.photographer;
        authorLink.href = result.currentImage.photographerUrl;

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = result.currentImage.url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 50;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 50, 50);
            const imageData = ctx.getImageData(0, 0, 50, 50).data;
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
            
            if (luminance > 0.5) {
                // Light color - use it for text on dark background
                document.getElementById('fact-container').style.color = `rgb(${r}, ${g}, ${b})`;
                document.getElementById('fact-container').style.backgroundColor = `rgba(0, 0, 0, 0.8)`;
            } else {
                // Dark color - use it for text on light background
                document.getElementById('fact-container').style.color = `rgb(${r}, ${g}, ${b})`;
                document.getElementById('fact-container').style.backgroundColor = `rgba(255, 255, 255, 0.8)`;
            }
        }
    });

    // Trigger background to fetch a new image for next time
    chrome.runtime.sendMessage({ action: 'fetchImage' });

    // Fetch a fact from the local JSON file
    fetch('facts.json')
        .then(response => response.json())
        .then(facts => {
            const factIdx = Math.floor(Math.random() * facts.length);
            const randomFact = facts[factIdx].fact;

            const factContainer = document.getElementById('fact-container');
            // Call the typeEffect function to animate the text
            typeEffect(factContainer, randomFact, 25);
        })
        .catch(error => {
            console.error('Error fetching the fact:', error);
            factContainer.textContent = 'Failed to load a fact.';
        });
});