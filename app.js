import { GenlayerClient } from './lib/genlayer/client.js';
import { WildGuess } from './lib/contracts/WildGuess.js';

// Configuration
const CONTRACT_ADDRESS = '0x21Ab0638F4f0FbcD5C1c87d1423b3874cDb69307'; // Update after deploying contract
const GENLAYER_RPC = 'https://studio.genlayer.com/api';
const CHAIN_ID = '0xf22f'; // 61999 in hex

// ImgBB API - Free image hosting (get your key at https://api.imgbb.com/)
// Using a demo key - replace with your own for production
const IMGBB_API_KEY = '92eb18ce1295fb12bbe68cc5af81c760'; // Demo key - get your own!

// State
let client = null;
let contract = null;
let currentAccount = null;
let selectedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkConnection();
});

function initializeEventListeners() {
    // Wallet connection
    document.getElementById('connectBtn').addEventListener('click', connectWallet);
    document.getElementById('welcomeConnectBtn').addEventListener('click', connectWallet);
    document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Challenge form
    document.getElementById('challengeForm').addEventListener('submit', handleChallengeSubmit);
    
    // Image URL input - preview
    document.getElementById('imageUrlInput').addEventListener('input', handleUrlInput);
    
    // File upload handling
    setupFileUpload();
    
    // Refresh buttons
    document.getElementById('refreshRecentBtn').addEventListener('click', loadRecentChallenges);
    document.getElementById('refreshLeaderboardBtn').addEventListener('click', loadLeaderboard);
}

function setupFileUpload() {
    const dropZone = document.createElement('div');
    dropZone.className = 'file-drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <div class="drop-zone-icon">📁</div>
            <div class="drop-zone-text">
                <strong>Drag & drop an image here</strong>
            </div>
            <button type="button" class="btn btn-secondary" id="browseFileBtn" style="margin-top: 15px;">
                📁 Browse Files
            </button>
            <div class="drop-zone-hint" style="margin-top: 15px;">Supports: JPG, PNG, GIF (max 5MB)</div>
            <input type="file" id="fileInput" accept="image/*" style="display: none;">
        </div>
        <div class="drop-zone-preview" style="display: none;">
            <img id="dropZonePreview" alt="Preview">
            <button type="button" class="remove-file-btn">✕ Remove</button>
        </div>
    `;
    
    // Insert drop zone before URL input
    const urlGroup = document.querySelector('.form-group');
    urlGroup.parentNode.insertBefore(dropZone, urlGroup);
    
    // NOW select elements AFTER they're in the DOM
    const fileInput = document.getElementById('fileInput');
    const preview = dropZone.querySelector('.drop-zone-preview');
    const previewImg = document.getElementById('dropZonePreview');
    const content = dropZone.querySelector('.drop-zone-content');
    const removeBtn = dropZone.querySelector('.remove-file-btn');
    const browseBtn = document.getElementById('browseFileBtn');
    
    // Browse button click
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // Drag & drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        } else {
            showToast('Please drop an image file', 'error');
        }
    });
    
    // Remove file
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Remove button clicked!');
            selectedFile = null;
            fileInput.value = '';
            preview.style.display = 'none';
            content.style.display = 'block';
            document.getElementById('imageUrlInput').value = '';
            document.getElementById('imageUrlInput').disabled = false;
            showToast('Image removed', 'info');
        });
    } else {
        console.error('Remove button not found!');
    }
    
    function handleFileSelect(file) {
        if (!file || !file.type) {
            showToast('Invalid file selected', 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be less than 5MB', 'error');
            return;
        }
        
        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'flex';
            content.style.display = 'none';
        };
        reader.onerror = (e) => {
            showToast('Failed to read file', 'error');
        };
        reader.readAsDataURL(file);
        
        // Disable URL input when file is selected
        document.getElementById('imageUrlInput').disabled = true;
        document.getElementById('imageUrlInput').value = '';
        
        showToast('Image ready to upload! 🎉', 'success');
    }
}

async function handleChallengeSubmit(e) {
    e.preventDefault();
    
    if (!contract) {
        showToast('Please connect your wallet first', 'error');
        return;
    }
    
    // Clear previous result display
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.style.display = 'none';
    
    const animalName = document.getElementById('animalNameInput').value.trim();
    let imageUrl = document.getElementById('imageUrlInput').value.trim();
    
    if (!animalName) {
        showToast('Please enter the animal name', 'error');
        return;
    }
    
    try {
        // If file is selected, upload it first
        if (selectedFile) {
            showLoading('Uploading image to hosting service...');
            imageUrl = await uploadImageToImgBB(selectedFile);
            showToast('Image uploaded successfully! 📸', 'success');
        }
        
        if (!imageUrl) {
            showToast('Please provide an image URL or upload a file', 'error');
            hideLoading();
            return;
        }
        
        // Get count of challenges BEFORE submitting (to identify the new one)
        const beforeChallenges = await contract.get_player_challenges(currentAccount, 1);
        const beforeCount = beforeChallenges ? beforeChallenges.length : 0;
        console.log(`Before submission: ${beforeCount} challenges`);
        
        // Store submission details to validate later
        const submittedAnimal = animalName.toLowerCase();
        const submittedImage = imageUrl;
        
        // Submit challenge to contract
        showLoading('Submitting challenge to AI... This may take 20-30 seconds');
        const txHash = await contract.submit_challenge(currentAccount, imageUrl, animalName);
        
        console.log('Transaction hash:', txHash);
        console.log(`Submitted: animal="${submittedAnimal}", image="${submittedImage}"`);
        showToast('Challenge submitted! Waiting for AI consensus...', 'info');
        
        // Wait for transaction to be processed - GenLayer AI consensus takes time
        // Try multiple times with increasing delays
        let attempts = 0;
        let maxAttempts = 6;
        let newChallenge = null;
        
        // Poll for results - looking for OUR specific challenge
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            attempts++;
            
            console.log(`Attempt ${attempts}/${maxAttempts}: Checking for NEW challenge result...`);
            showLoading(`Waiting for AI analysis... (${attempts}/${maxAttempts})`);
            
            const recentChallenges = await contract.get_player_challenges(currentAccount, 3);
            console.log('Recent challenges response:', recentChallenges);
            
            if (recentChallenges && recentChallenges.length > 0) {
                // Look for the challenge that matches our submission
                for (const challenge of recentChallenges) {
                    const challengeData = challenge instanceof Map ? Object.fromEntries(challenge) : challenge;
                    const challengeAnimal = (challengeData.correct_animal || '').toLowerCase();
                    const challengeImage = challengeData.image_url || '';
                    
                    console.log(`Checking challenge: animal="${challengeAnimal}", image="${challengeImage}"`);
                    
                    // Match by BOTH animal name AND image URL to be sure it's the right one
                    if (challengeAnimal === submittedAnimal && challengeImage === submittedImage) {
                        console.log('✅ Found OUR challenge!');
                        newChallenge = challengeData;
                        break;
                    }
                }
                
                if (newChallenge) {
                    break; // Found it!
                }
            }
        }
        
        hideLoading();
        
        // Check if we found the NEW challenge
        if (newChallenge) {
            console.log('Latest challenge data:', newChallenge);
            
            // Check if AI had an error
            const aiGuess = newChallenge.ai_guess || 'Processing...';
            const hasError = aiGuess.includes('error:') || aiGuess.includes('timeout');
            const displayAiGuess = hasError ? '⚠️ Image loading failed' : aiGuess;
            
            // Display result
            displayChallengeResult({
                player_won: newChallenge.you_won || newChallenge.result === 'win',
                ai_guess: displayAiGuess,
                correct_animal: newChallenge.correct_animal || animalName,
                has_error: hasError,
                message: hasError 
                    ? `⚠️ AI couldn't load the image. Try using a direct image URL (ending in .jpg or .png) instead of file upload.`
                    : (newChallenge.you_won || newChallenge.result === 'win')
                        ? `🎉 You won! AI guessed '${displayAiGuess}' but it was '${newChallenge.correct_animal}'!`
                        : `😔 AI got it! Correctly identified as '${displayAiGuess}'`
            });
        } else {
            console.error('Could not find the new challenge after all attempts');
            showToast('Challenge submitted! AI is still processing. Check Recent Games tab in a moment.', 'warning');
        }
        
        // Reset form completely
        document.getElementById('challengeForm').reset();
        selectedFile = null;
        
        // Reset file upload area
        const dropZonePreview = document.querySelector('.drop-zone-preview');
        const dropZoneContent = document.querySelector('.drop-zone-content');
        if (dropZonePreview) dropZonePreview.style.display = 'none';
        if (dropZoneContent) dropZoneContent.style.display = 'block';
        
        // Reset URL preview
        const urlPreview = document.getElementById('previewImage');
        if (urlPreview) {
            urlPreview.style.display = 'none';
            urlPreview.src = '';
        }
        
        // Re-enable inputs
        document.getElementById('imageUrlInput').disabled = false;
        document.getElementById('imageUrlInput').value = '';
        document.getElementById('animalNameInput').value = '';
        
        // Reset file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        
        // Refresh stats and recent games
        await loadPlayerStats();
        
        // If we're on the Recent Games tab, refresh it automatically
        const recentTab = document.getElementById('recentTab');
        if (recentTab && recentTab.classList.contains('active')) {
            await loadRecentChallenges();
        }
        
    } catch (error) {
        console.error('Challenge error:', error);
        hideLoading();
        showToast('Failed to submit challenge: ' + error.message, 'error');
    }
}

async function uploadImageToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('ImgBB upload response:', data);
            console.log('Image URL:', data.data.url);
            console.log('Display URL:', data.data.display_url);
            // Use display_url instead of url for better compatibility
            const imageUrl = data.data.display_url || data.data.url;
            console.log('Using URL:', imageUrl);
            return imageUrl;
        } else {
            throw new Error(data.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error('ImgBB upload error:', error);
        throw new Error('Failed to upload image. Please try using a direct URL instead.');
    }
}

function handleUrlInput(e) {
    const url = e.target.value.trim();
    const preview = document.getElementById('previewImage');
    
    if (url && isValidImageUrl(url)) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = () => {
            preview.style.display = 'none';
            showToast('Could not load image from URL', 'error');
        };
    } else {
        preview.style.display = 'none';
    }
}

function isValidImageUrl(url) {
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) || url.includes('cataas.com');
    } catch {
        return false;
    }
}

function displayChallengeResult(result) {
    const resultDisplay = document.getElementById('resultDisplay');
    const resultContent = document.getElementById('resultContent');
    
    console.log('Challenge result:', result);
    
    // Extract result data from contract response
    const youWon = result.player_won || false;
    const hasError = result.has_error || false;
    const aiGuess = result.ai_guess || 'Unknown';
    const correctAnimal = result.correct_animal || 'Unknown';
    const message = result.message || '';
    
    const resultClass = hasError ? 'result-error' : (youWon ? 'result-win' : 'result-loss');
    const emoji = hasError ? '⚠️' : (youWon ? '🎉' : '😔');
    const title = hasError ? 'Image Load Error' : (youWon ? 'You Won!' : 'AI Got It Right!');
    
    resultContent.innerHTML = `
        <div class="${resultClass}">
            <button class="result-close-btn" onclick="document.getElementById('resultDisplay').style.display='none'">✕</button>
            <div class="result-emoji">${emoji}</div>
            <h3>${title}</h3>
            <div class="result-details">
                <div class="result-row">
                    <span class="result-label">Your Answer:</span>
                    <span class="result-value">${correctAnimal}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">AI Status:</span>
                    <span class="result-value">${aiGuess}</span>
                </div>
            </div>
            ${message ? `
                <div class="result-reasoning">
                    <p>${message}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    resultDisplay.style.display = 'block';
    resultDisplay.scrollIntoView({ behavior: 'smooth' });
    
    if (youWon && !hasError) {
        confetti();
    }
    
    // Auto-dismiss result after 15 seconds
    setTimeout(() => {
        resultDisplay.style.display = 'none';
    }, 15000);
}

async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    }
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showToast('Please install MetaMask!', 'error');
        return;
    }
    
    try {
        showLoading('Connecting wallet...');
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== CHAIN_ID) {
            await switchToGenlayerNetwork();
        }
        
        client = new GenlayerClient(GENLAYER_RPC, currentAccount);
        contract = new WildGuess(CONTRACT_ADDRESS, client);
        
        updateWalletUI();
        showGameScreen();
        await loadPlayerStats();
        
        hideLoading();
        showToast('Wallet connected! 🎮', 'success');
        
    } catch (error) {
        console.error('Connection error:', error);
        hideLoading();
        showToast('Failed to connect wallet: ' + error.message, 'error');
    }
}

async function switchToGenlayerNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_ID }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CHAIN_ID,
                        chainName: 'GenLayer Studio',
                        nativeCurrency: {
                            name: 'GEN',
                            symbol: 'GEN',
                            decimals: 18
                        },
                        rpcUrls: [GENLAYER_RPC],
                    }],
                });
            } catch (addError) {
                throw new Error('Failed to add GenLayer network');
            }
        } else {
            throw switchError;
        }
    }
}

function disconnectWallet() {
    currentAccount = null;
    client = null;
    contract = null;
    
    updateWalletUI();
    
    // Show welcome screen
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'flex';
    
    showToast('Wallet disconnected', 'info');
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connectBtn');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    
    if (currentAccount) {
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        walletAddress.textContent = formatAddress(currentAccount);
    } else {
        connectBtn.style.display = 'block';
        walletInfo.style.display = 'none';
    }
}

function showGameScreen() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
}

async function loadPlayerStats() {
    if (!contract || !currentAccount) return;
    
    try {
        const stats = await contract.get_player_stats(currentAccount);
        console.log('Player stats:', stats);
        
        // Convert Map to object if needed
        const statsData = stats instanceof Map ? Object.fromEntries(stats) : stats;
        
        // Convert BigInt to Number
        const wins = Number(statsData.wins || 0n);
        const total = Number(statsData.total_challenges || 0n);
        const currentStreak = Number(statsData.current_streak || 0n);
        
        document.getElementById('statWins').textContent = wins;
        document.getElementById('statTotal').textContent = total;
        
        const winRate = total > 0 
            ? Math.round((wins / total) * 100)
            : 0;
        document.getElementById('statWinRate').textContent = winRate + '%';
        document.getElementById('statStreak').textContent = '🔥 ' + currentStreak;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentChallenges() {
    if (!contract || !currentAccount) return;
    
    const recentList = document.getElementById('recentList');
    
    try {
        recentList.innerHTML = '<div class="loading">Loading...</div>';
        
        const challenges = await contract.get_player_challenges(currentAccount, 10);
        
        if (!challenges || challenges.length === 0) {
            recentList.innerHTML = '<div class="empty-state">No challenges yet. Start playing! 🎮</div>';
            return;
        }
        
        recentList.innerHTML = challenges.map((challenge, index) => {
            // Convert Map to object if needed
            const challengeData = challenge instanceof Map ? Object.fromEntries(challenge) : challenge;
            
            const isWin = challengeData.you_won || challengeData.result === 'win';
            const imageUrl = challengeData.image_url || '';
            const aiGuess = challengeData.ai_guess || '';
            
            // Check if AI had an error
            const hasError = aiGuess.includes('error:') || aiGuess.includes('timeout');
            const displayAiGuess = hasError ? '⚠️ Image load failed' : aiGuess;
            
            console.log(`Challenge #${index}: image_url = ${imageUrl}, ai_guess = ${aiGuess}`);
            
            return `
                <div class="game-history-item ${isWin ? 'win' : 'loss'}">
                    <div class="history-image">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${challengeData.correct_animal}" onerror="this.src='https://via.placeholder.com/150?text=Image+Failed'">` : '<div class="no-image">📷</div>'}
                    </div>
                    <div class="history-content">
                        <div class="history-header">
                            <span class="history-result ${isWin ? 'win-badge' : hasError ? 'error-badge' : 'loss-badge'}">
                                ${isWin ? '✅ You Won' : hasError ? '⚠️ Error' : '❌ AI Won'}
                            </span>
                            <span class="history-time">${formatDate(challengeData.timestamp)}</span>
                        </div>
                        <div class="history-details">
                            <div class="history-row">
                                <span class="label">You said:</span>
                                <span class="value correct">${challengeData.correct_animal}</span>
                            </div>
                            <div class="history-row">
                                <span class="label">AI said:</span>
                                <span class="value ${hasError ? 'error' : isWin ? 'incorrect' : 'correct'}">${displayAiGuess}</span>
                            </div>
                            ${hasError ? `
                            <div class="error-hint">
                                <small>💡 Tip: Try using a direct image URL (ending in .jpg, .png) instead of file upload</small>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading challenges:', error);
        recentList.innerHTML = '<div class="error-state">Failed to load challenges</div>';
    }
}

async function loadLeaderboard() {
    if (!contract) return;
    
    const leaderboardList = document.getElementById('leaderboardList');
    
    try {
        leaderboardList.innerHTML = '<div class="loading">Loading...</div>';
        
        const leaderboard = await contract.get_leaderboard(10);
        console.log('Leaderboard data:', leaderboard);
        
        if (!leaderboard || leaderboard.length === 0) {
            leaderboardList.innerHTML = '<div class="empty-state">No players yet. Be the first! 🏆</div>';
            return;
        }
        
        leaderboardList.innerHTML = leaderboard.map((player, index) => {
            // Convert Map to object if needed
            const playerData = player instanceof Map ? Object.fromEntries(player) : player;
            console.log('Player data:', playerData);
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            // Convert BigInt to Number
            const totalChallenges = Number(playerData.total_challenges || 0n);
            const wins = Number(playerData.wins || 0n);
            const currentStreak = Number(playerData.current_streak || playerData.best_streak || 0n);
            
            const winRate = totalChallenges > 0 
                ? Math.round((wins / totalChallenges) * 100)
                : 0;
            
            // Use 'player' field instead of 'address'
            const address = playerData.player || playerData.address || 'Unknown';
            
            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${medal || (index + 1)}</div>
                    <div class="leaderboard-player">
                        <div class="leaderboard-address">${address !== 'Unknown' ? formatAddress(address) : address}</div>
                        <div class="leaderboard-stats">
                            ${wins} wins • ${totalChallenges} games • ${winRate}% win rate
                        </div>
                    </div>
                    <div class="leaderboard-score">
                        🔥 ${currentStreak}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<div class="error-state">Failed to load leaderboard</div>';
    }
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Load data for the tab
    if (tabName === 'recent') {
        loadRecentChallenges();
    } else if (tabName === 'leaderboard') {
        loadLeaderboard();
    } else if (tabName === 'play') {
        // Refresh stats when returning to play tab
        loadPlayerStats();
    }
}

// Utility Functions
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(message = 'Processing...') {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function confetti() {
    // Simple confetti animation
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transition = 'all 2s ease-out';
        confetti.style.zIndex = '10000';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.style.top = window.innerHeight + 'px';
            confetti.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else if (currentAccount && accounts[0] !== currentAccount) {
            location.reload();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}
