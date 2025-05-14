const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
}));

// Route to fetch a batch of random images
app.get('/api/images', async(req, res) => {
    // Parse comma-separated environment variables
    const categories = (process.env.CATEGORIES || 'nature').split(',').map(item => item.trim());
    const pages = (process.env.PAGES || '1').split(',').map(item => Number(item.trim()));
    const categoryIdx = Math.floor(Math.random() * categories.length);
    const category = categories[categoryIdx] || categories[0];
    const pageIdx = Math.floor(Math.random() * pages.length);
    const page = pages[pageIdx] || pages[0];
    const query = `https://api.unsplash.com/search/photos?query=${category}&page=${page}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
    
    // Fetch the data from Unsplash API
    const response = await fetch(query);

    if(!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch data from Unsplash API' });
    }

    const data = await response.json();

    // Select the first 10 images from the results to send back
    const filteredResults = data.results.slice(0,10).map(result =>({
        imageId:result.id, 
        url: result.urls.regular,
        downloadLocation: result.links.download_location,
        photographer:{
            name: result.user.name,
            url: result.user.links.html
        }
    }));

    // Send the filtered results back to the client
    res.json({images: filteredResults});

    // Make sure to properly let Unplash know that the images were 'downloaded.'
    // filteredResults.forEach(image => {
    //     fetch(image.downloadLocation, {
    //         method:'GET', 
    //         headers:{
    //             Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    //         }
    //     }).catch(error => console.error('Error triggering download:', error));
    // });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});