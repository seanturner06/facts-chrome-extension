const fetch = require('node-fetch');

let cachedFacts = [];

async function loadFacts() {
    try {
        const url = process.env.FACTS_URL;
        if (!url) throw new Error("FACTS_URL is not defined");

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch facts: ${response.status}`);
        }

        const data = await response.json();
        cachedFacts = data.facts || data;

        console.log(`Loaded ${cachedFacts.length} facts`);
    }   catch (err) {
            console.error("Error loading facts:", err);
            cachedFacts = []; // fail gracefully
        }
}

function getRandomFact() {
    if (cachedFacts.length === 0) return null;
    const index = Math.floor(Math.random() * cachedFacts.length);
    return cachedFacts[index];
}

module.exports = {
    loadFacts,
    getRandomFact
};
