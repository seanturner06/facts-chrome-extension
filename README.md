# 🧠 TabFlux: Chrome Extension for Daily Inspiration

TabFlux is a custom Chrome extension that replaces your new tab with a stunning Unsplash image and a thought-provoking fact. Designed with performance, security, and UX in mind, it uses a proxy backend to securely fetch data and protect API keys.

## 🚀 Features

- 📷 **Random Unsplash Images**: Fetches a new high-quality image with every new tab
- 🧠 **Random Facts**: Displays an interesting, obscure fact from a private dataset
- 🔐 **Secure Proxy Backend**: API keys are kept server-side via a custom Node.js proxy
- ⚙️ **Minimal Footprint**: Lightweight extension, fast load, no bloat

## 🧩 Tech Stack

- **Frontend**: Chrome Extension (HTML, JS)
- **Backend**: Node.js (Express) hosted on Render
- **Data**: Private `facts.json` file served securely
- **External API**: Unsplash (via backend proxy)

## 🧠 What I Learned

- Chrome Extension architecture: manifest v3, background scripts, tab overrides
- CORS handling and secure API key management via backend proxy
- Environment variable usage and secret management in deployment
- Deploying full-stack apps using Render
- Clean project separation between frontend extension logic and backend services

📌 **License**: This project is licensed under a custom license. **Use is strictly prohibited without permission.**

## Demo 

https://github.com/user-attachments/assets/5039ba74-5e66-405b-b160-9d4661d1c7e4



