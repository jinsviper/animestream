/* =========================================
   1. CORE PLAYER & WATCHLIST LOGIC
   ========================================= */
function openPlayer(title, youtubeID, imageURL) {
    const playerSection = document.getElementById('main-video');
    const iframe = document.getElementById('main-video-player');
    const poster = document.getElementById('video-poster');
    const titleElement = document.getElementById('video-title');
    const watchlistBtn = document.getElementById('add-watchlist-btn');

    playerSection.style.display = "grid";
    if (titleElement) titleElement.innerText = "Now Playing: " + title;

    if (poster && imageURL) {
        poster.style.backgroundImage = `url('${imageURL}')`;
        poster.style.display = "block"; 
    }

    const finalID = (youtubeID && youtubeID !== 'null') ? youtubeID : "dQw4w9WgXcQ";
    iframe.src = `https://www.youtube.com/embed/${finalID}?autoplay=1`;

    // Update Watchlist Button Click Event
    watchlistBtn.onclick = () => addToWatchlist(title, youtubeID, imageURL);

    document.getElementById('affiliate-link').href = `https://www.amazon.com/s?k=${encodeURIComponent(title)}+anime+merch`;
    playerSection.scrollIntoView({ behavior: 'smooth' });
}

/* =========================================
   2. WATCHLIST STORAGE ENGINE
   ========================================= */
function addToWatchlist(title, youtubeID, imageURL) {
    let watchlist = JSON.parse(localStorage.getItem('animeWatchlist')) || [];
    
    // Check if already in watchlist
    if (watchlist.some(item => item.title === title)) {
        alert("Already in your watchlist!");
        return;
    }

    watchlist.push({ title, youtubeID, imageURL });
    localStorage.setItem('animeWatchlist', JSON.stringify(watchlist));
    displayWatchlist();
    alert("Added to Watchlist!");
}

function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('animeWatchlist')) || [];
    const container = document.getElementById('watchlist-section');
    const list = document.getElementById('watchlist-list');

    if (watchlist.length === 0) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";
    list.innerHTML = "";

    watchlist.forEach(anime => {
        const cleanTitle = anime.title.replace(/'/g, "\\'");
        list.innerHTML += `
            <div class="anime-card" onclick="openPlayer('${cleanTitle}', '${anime.youtubeID}', '${anime.imageURL}')" style="min-width:180px">
                <img src="${anime.imageURL}">
                <div class="anime-info">
                    <h4 style="font-size:12px;">${anime.title}</h4>
                </div>
            </div>`;
    });
}

function clearWatchlist() {
    localStorage.removeItem('animeWatchlist');
    displayWatchlist();
}

/* =========================================
   3. SEARCH & API LOGIC
   ========================================= */
async function searchLiveAnime() {
    const query = document.getElementById('userQuery').value;
    const resultsDiv = document.getElementById('searchResults');
    const trendingList = document.getElementById('anime-list');
    
    resultsDiv.innerHTML = "Searching...";
    if (trendingList) trendingList.style.display = "none";

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=12`);
        const result = await response.json();
        resultsDiv.innerHTML = "";

        result.data.forEach(anime => {
            const cleanTitle = anime.title.replace(/'/g, "\\'");
            resultsDiv.innerHTML += `
                <div class="anime-card" onclick="openPlayer('${cleanTitle}', '${anime.trailer?.youtube_id}', '${anime.images.jpg.large_image_url}')">
                    <img src="${anime.images.jpg.image_url}">
                    <div class="anime-info"><h4>${anime.title}</h4></div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function loadTrending() {
    const trendingList = document.getElementById('anime-list');
    try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
        const result = await response.json();
        trendingList.innerHTML = "";
        result.data.forEach(anime => {
            const cleanTitle = anime.title.replace(/'/g, "\\'");
            trendingList.innerHTML += `
                <div class="anime-card" onclick="openPlayer('${cleanTitle}', '${anime.trailer?.youtube_id}', '${anime.images.jpg.large_image_url}')" style="min-width:200px">
                    <img src="${anime.images.jpg.image_url}">
                    <div class="anime-info"><h4>${anime.title}</h4></div>
                </div>`;
        });
    } catch (error) { console.error(error); }
}

async function loadAnimeNews() {
    const newsFeed = document.getElementById('news-feed');
    try {
        const response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=4');
        const result = await response.json();
        newsFeed.innerHTML = "";
        result.data.forEach(item => {
            newsFeed.innerHTML += `<div class="news-card">
                <img src="${item.images.jpg.image_url}">
                <div class="news-content"><h3>${item.title} Updates</h3><a href="${item.url}" target="_blank">Read More</a></div>
            </div>`;
        });
    } catch (error) { console.error(error); }
}

/* =========================================
   4. INITIALIZATION (Optimized)
   ========================================= */
window.onload = function() {
    // Starts all three processes at the exact same time for faster loading
    Promise.all([
        loadTrending(),
        loadAnimeNews(),
        displayWatchlist()
    ]).catch(err => console.error("Error initializing site:", err));
};