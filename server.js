const express = require('express');
const limiter = require('express-rate-limit');
const cors = require('cors');
const fetch = require('node-fetch');
const {loadFacts, getRandomFact} = require('./factLoader');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Load facts from the external URL
loadFacts();

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

    let filteredResults = [];
    let size = data.results.length;

    for(let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * size);
        let result = {
            imageId: data.results[randomIndex].id, 
            url: data.results[randomIndex].urls.small,
            downloadLocation: data.results[randomIndex].links.download_location,
            photographer:{
                name: data.results[randomIndex].user.name,
                url: data.results[randomIndex].user.links.html
            }
        }
        filteredResults.push(result);
    }

    // Send the filtered results back to the client
    res.json({images: filteredResults});
});

// Route to fetch random facts
app.get('/api/facts', async(req, res) => {
    // Loop through and select 5 random facts to cache
    let randomFacts = [];
    for(let i = 0; i < 10; i++) {
        randomFacts.push(getRandomFact());
    }
    // Send the random facts back to the client
    res.json({ facts: randomFacts });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});