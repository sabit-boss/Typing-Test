// Sample texts for typing test
const sampleTexts = [
    "the quick brown fox jumps over the lazy dog while the clever cat watches from a distance the fox is known for its speed and agility while the dog prefers to rest in the shade of a large oak tree nearby the cat remains patient waiting for the perfect moment to make its move",
    "programming is the process of creating instructions for computers to follow these instructions are written in various programming languages each with its own syntax and rules learning to code requires patience practice and problem solving skills as you progress you will discover the joy of building useful applications",
    "artificial intelligence is transforming our world in countless ways from virtual assistants to self driving cars machine learning algorithms are becoming increasingly sophisticated these technologies are helping us solve complex problems and make better decisions in various fields including healthcare education and business",
    "the internet has revolutionized how we communicate work and access information it connects billions of devices worldwide creating a vast network of knowledge and opportunities social media platforms allow us to stay connected with friends and family while online learning resources make education accessible to everyone",
    "typing speed and accuracy are essential skills in today's digital world whether you're writing emails coding or creating content being able to type quickly and accurately can significantly improve your productivity regular practice with typing exercises can help you develop muscle memory and increase your words per minute"
];

// Word lists for generating random text
const wordLists = {
    subjects: [
        'the programmer', 'the student', 'the teacher', 'the artist', 'the scientist',
        'the engineer', 'the writer', 'the designer', 'the musician', 'the athlete',
        'the chef', 'the doctor', 'the entrepreneur', 'the researcher', 'the explorer'
    ],
    verbs: [
        'creates', 'develops', 'builds', 'designs', 'writes', 'composes',
        'discovers', 'invents', 'explores', 'learns', 'teaches', 'studies',
        'researches', 'analyzes', 'solves', 'implements', 'optimizes'
    ],
    objects: [
        'new applications', 'innovative solutions', 'creative projects',
        'beautiful designs', 'complex algorithms', 'efficient systems',
        'interactive websites', 'mobile applications', 'data structures',
        'machine learning models', 'artificial intelligence systems',
        'user interfaces', 'database systems', 'cloud solutions',
        'security protocols', 'network architectures'
    ],
    adjectives: [
        'efficient', 'innovative', 'creative', 'powerful', 'scalable',
        'secure', 'reliable', 'flexible', 'intuitive', 'robust',
        'modern', 'advanced', 'sophisticated', 'elegant', 'dynamic'
    ],
    connectors: [
        'while', 'because', 'although', 'since', 'when',
        'if', 'unless', 'until', 'before', 'after'
    ],
    locations: [
        'in the digital world', 'in the modern era', 'in the tech industry',
        'in the workplace', 'in the classroom', 'in the laboratory',
        'in the studio', 'in the field', 'in the market', 'in the community'
    ]
};

// DOM Elements
const textDisplay = document.getElementById('text-display');
const inputArea = document.getElementById('input-area');
const wpmDisplay = document.getElementById('wpm');
const timeDisplay = document.getElementById('time');
const mistakesDisplay = document.getElementById('mistakes');
const retryBtn = document.getElementById('retry-btn');
const nextBtn = document.getElementById('next-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardModal = document.getElementById('leaderboard-modal');
const scoreModal = document.getElementById('score-modal');
const finalScore = document.getElementById('final-score');
const finalMistakes = document.getElementById('final-mistakes');
const saveScoreBtn = document.getElementById('save-score');

// Variables
let currentText = '';
let isTestActive = false;
let startTime = 0;
let timerInterval;
let currentWordIndex = 0;
let correctWords = 0;
let incorrectWords = 0;
let lastWordTime = 0;
let wordTimes = [];
let currentWPM = 0;
let mistakes = 0;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let speedData = [];
let speedChart = null;

// Comments Section
const commentsKey = 'typingTestComments';
const commentsForm = document.getElementById('comments-form');
const commentsList = document.getElementById('comments-list');

// --- Monkeytype-style typing logic ---
let wordsArray = [];
let incorrectIndexes = [];

// Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxI09tWTn_aYH_469wXwVWJDaWwrw2QH6iYwknh0TJw5vtx9cqtOk5tYjU6C1a91kYyNg/exec';

// Initialize speed chart
function initSpeedChart() {
    const ctx = document.getElementById('speedGraph').getContext('2d');
    speedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'WPM',
                data: [],
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update speed chart
function updateSpeedChart(wpm) {
    const timeElapsed = Math.floor((new Date() - startTime) / 1000);
    speedData.push({ time: timeElapsed, wpm: wpm });
    
    if (speedChart) {
        speedChart.data.labels = speedData.map(d => d.time);
        speedChart.data.datasets[0].data = speedData.map(d => d.wpm);
        speedChart.update();
    }
}

// Initialize
function init() {
    initSpeedChart();
    loadNewText();
    setupEventListeners();
    updateLeaderboard();
    loadComments();
    if (commentsForm) commentsForm.addEventListener('submit', handleCommentSubmit);
}

// Generate a random sentence
function generateSentence() {
    const subject = getRandomElement(wordLists.subjects);
    const verb = getRandomElement(wordLists.verbs);
    const object = getRandomElement(wordLists.objects);
    const adjective = getRandomElement(wordLists.adjectives);
    const connector = getRandomElement(wordLists.connectors);
    const location = getRandomElement(wordLists.locations);
    
    // Randomly choose a sentence structure
    const structures = [
        `${subject} ${verb} ${adjective} ${object} ${location}`,
        `${subject} ${verb} ${object} ${connector} ${subject} ${verb} ${adjective} ${object}`,
        `${adjective} ${object} ${verb} ${location} ${connector} ${subject} ${verb} ${object}`,
        `${subject} ${verb} ${object} ${location} ${connector} ${subject} ${verb} ${adjective} ${object}`,
        `${adjective} ${object} ${verb} ${location} ${connector} ${subject} ${verb} ${adjective} ${object}`
    ];
    
    return getRandomElement(structures);
}

// Generate a complete typing text
function generateTypingText() {
    const sentences = [];
    const numSentences = Math.floor(Math.random() * 3) + 3; // 3-5 sentences
    
    for (let i = 0; i < numSentences; i++) {
        sentences.push(generateSentence());
    }
    
    return sentences.join(' ');
}

// Helper function to get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Prevent pasting in the prompt
textDisplay.addEventListener('paste', e => e.preventDefault());

// Listen for input events on the prompt
textDisplay.addEventListener('input', handleInput);

// Focus prompt on load and after retry/next
function focusPrompt() {
    textDisplay.focus();
    // Move caret to end
    const range = document.createRange();
    range.selectNodeContents(textDisplay);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// Load new text
function loadNewText() {
    currentText = generateTypingText().toLowerCase();
    wordsArray = currentText.split(' ');
    incorrectIndexes = [];
    renderPrompt();
    resetTest();
    inputArea.value = '';
    inputArea.focus();
}

function renderPrompt() {
    textDisplay.innerHTML = '';
    wordsArray.forEach((word, idx) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        if (idx < currentWordIndex) {
            span.className = incorrectIndexes.includes(idx) ? 'incorrect' : 'correct';
        } else if (idx === currentWordIndex) {
            span.className = 'current';
        } else {
            span.className = 'upcoming';
        }
        textDisplay.appendChild(span);
    });
}

// Reset test state
function resetTest() {
    isTestActive = false;
    currentWordIndex = 0;
    correctWords = 0;
    incorrectWords = 0;
    mistakes = 0;
    startTime = 0;
    lastWordTime = 0;
    wordTimes = [];
    currentWPM = 0;
    
    wpmDisplay.textContent = '0';
    timeDisplay.textContent = '40';
    mistakesDisplay.textContent = '0';
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset all spans
    const spans = textDisplay.getElementsByTagName('span');
    Array.from(spans).forEach(span => {
        span.className = '';
    });
    
    inputArea.textContent = '';
}

// Handle input
function handleInput(e) {
    if (!isTestActive) {
        isTestActive = true;
        startTime = Date.now();
        lastWordTime = startTime;
        timerInterval = setInterval(updateTimer, 1000);
    }
    // On space or enter, check word
    if (e.inputType === 'insertText' && (e.data === ' ' || e.data === '\n') || e.key === ' ' || e.key === 'Enter') {
        checkCurrentWord();
        e.preventDefault && e.preventDefault();
        return false;
    }
    // Prevent spaces in the input
    inputArea.value = inputArea.value.replace(/\s/g, '');
    renderPrompt();
}

function checkCurrentWord() {
    const typed = inputArea.value.trim();
    if (typed === '') return; // Do nothing if input is empty
    const expected = wordsArray[currentWordIndex];
    if (typed === expected) {
        correctWords++;
    } else {
        incorrectWords++;
        mistakes++;
        incorrectIndexes.push(currentWordIndex);
    }
    currentWordIndex++;
    inputArea.value = '';
    renderPrompt();
    updateStats();
    if (currentWordIndex >= wordsArray.length) {
        endTest();
    }
}

inputArea.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.key === 'Enter') {
        checkCurrentWord();
        e.preventDefault();
    }
});

// Update stats
function updateStats() {
    const timeElapsed = Math.max((Date.now() - startTime) / 1000 / 60, 0.01); // avoid zero
    currentWPM = Math.round(correctWords / timeElapsed);
    wpmDisplay.textContent = isFinite(currentWPM) ? currentWPM : 0;
    mistakesDisplay.textContent = mistakes;
    updateSpeedChart(currentWPM);
}

// Update timer
function updateTimer() {
    let timeLeft = parseInt(timeDisplay.textContent) - 1;
    if (timeLeft <= 0) {
        timeLeft = 0;
        timeDisplay.textContent = timeLeft;
        endTest();
    } else {
        timeDisplay.textContent = timeLeft;
    }
}

// End test
function endTest() {
    isTestActive = false;
    clearInterval(timerInterval);
    timeDisplay.textContent = '0';
    retryBtn.disabled = false;
    nextBtn.disabled = false;
    if (currentWPM > 0) {
        showScoreModal();
    }
}

// Setup event listeners
function setupEventListeners() {
    inputArea.addEventListener('input', handleInput);
    inputArea.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            checkCurrentWord();
            e.preventDefault();
        }
    });
    retryBtn.addEventListener('click', loadNewText);
    nextBtn.addEventListener('click', loadNewText);
    document.getElementById('leaderboard-btn').addEventListener('click', () => {
        document.getElementById('leaderboard-modal').style.display = 'flex';
    });
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('leaderboard-modal').style.display = 'none';
    });
    document.getElementById('save-score').addEventListener('click', saveScore);
    document.getElementById('skip-score').addEventListener('click', () => {
        scoreModal.style.display = 'none';
    });
}

function showScoreModal() {
    const totalWords = currentText.split(/\s+/).length;
    const accuracy = mistakes === 0 ? 100 : Math.round((correctWords / totalWords) * 100);
    // Prepare the new entry
    const newEntry = {
        wpm: currentWPM,
        accuracy: accuracy,
        mistakes: mistakes
    };
    // Get leaderboard from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    // Insert the new entry temporarily to determine rank
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => {
        if (b.wpm === a.wpm) {
            return b.accuracy - a.accuracy;
        }
        return b.wpm - a.wpm;
    });
    const rank = leaderboard.findIndex(entry => entry === newEntry) + 1;
    // Only top 10 are shown
    if (rank > 10) {
        // Not on leaderboard, don't show modal
        return;
    }
    // Set modal message
    let modalTitle = '';
    if (rank === 1) {
        modalTitle = 'New High Score!';
    } else {
        modalTitle = `You placed #${rank} on the leaderboard!`;
    }
    scoreModal.querySelector('h2').textContent = modalTitle;
    finalScore.textContent = `${currentWPM} WPM (${accuracy}% accuracy)`;
    finalMistakes.textContent = mistakes;
    scoreModal.style.display = 'flex';
}

// Update saveScore function
async function saveScore() {
    const playerName = document.getElementById('player-name').value.trim();
    const playerCountry = document.getElementById('player-country').value.trim();
    
    if (!playerName || !playerCountry) {
        alert('Please enter both name and country');
        return;
    }

    const score = {
        name: playerName,
        country: playerCountry,
        wpm: currentWPM,
        mistakes: mistakes,
        date: new Date().toLocaleDateString()
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(score),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.result === 'success') {
            // Save to local leaderboard for display
            leaderboard.push(score);
            leaderboard.sort((a, b) => b.wpm - a.wpm);
            leaderboard = leaderboard.slice(0, 10);
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            scoreModal.style.display = 'none';
            updateLeaderboard();
            alert('Score saved successfully!');
        } else {
            throw new Error('Failed to save score');
        }
    } catch (error) {
        console.error('Error saving score:', error);
        alert('Error saving score. Please try again.');
    }
}

// Update updateLeaderboard function
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    // Display top 10
    leaderboard.slice(0, 10).forEach(score => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span>${score.name} (${score.country})</span>
            <span>${score.wpm} WPM</span>
            <span>${score.mistakes} mistakes</span>
        `;
        leaderboardList.appendChild(item);
    });
}

function loadComments() {
    const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <strong>${comment.name}</strong>: <span>${comment.text}</span>
        </div>
    `).join('');
}

function handleCommentSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    if (name && text) {
        const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
        comments.unshift({ name, text });
        localStorage.setItem(commentsKey, JSON.stringify(comments));
        document.getElementById('comment-name').value = '';
        document.getElementById('comment-text').value = '';
        loadComments();
    }
}

// --- Admin Panel Logic ---
function showAdminPanel() {
    const adminModal = document.getElementById('admin-modal');
    const adminClose = document.getElementById('admin-close');
    const adminCommentsList = document.getElementById('admin-comments-list');
    const adminLeaderboardList = document.getElementById('admin-leaderboard-list');

    // Show modal
    adminModal.style.display = 'flex';
    adminClose.onclick = () => { adminModal.style.display = 'none'; };

    // Comments
    function renderAdminComments() {
        const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
        adminCommentsList.innerHTML = comments.map((c, i) => `
            <div class="admin-item">
                <input class="admin-input" value="${c.name}" data-type="name" data-idx="${i}" />
                <input class="admin-input" value="${c.text}" data-type="text" data-idx="${i}" />
                <button class="admin-edit" data-idx="${i}">Save</button>
                <button class="admin-delete" data-idx="${i}">Delete</button>
            </div>
        `).join('');
    }
    renderAdminComments();
    adminCommentsList.onclick = function(e) {
        const idx = e.target.dataset.idx;
        if (e.target.classList.contains('admin-edit')) {
            const name = adminCommentsList.querySelector(`input[data-type='name'][data-idx='${idx}']`).value;
            const text = adminCommentsList.querySelector(`input[data-type='text'][data-idx='${idx}']`).value;
            const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
            comments[idx] = { name, text };
            localStorage.setItem(commentsKey, JSON.stringify(comments));
            renderAdminComments();
            loadComments();
        } else if (e.target.classList.contains('admin-delete')) {
            const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
            comments.splice(idx, 1);
            localStorage.setItem(commentsKey, JSON.stringify(comments));
            renderAdminComments();
            loadComments();
        }
    };

    // Leaderboard
    function renderAdminLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        adminLeaderboardList.innerHTML = leaderboard.map((entry, i) => `
            <div class="admin-item">
                <input class="admin-input" value="${entry.name || ''}" data-type="name" data-idx="${i}" />
                <input class="admin-input" value="${entry.country || ''}" data-type="country" data-idx="${i}" />
                <input class="admin-input" value="${entry.wpm}" data-type="wpm" data-idx="${i}" />
                <input class="admin-input" value="${entry.accuracy}" data-type="accuracy" data-idx="${i}" />
                <button class="admin-edit" data-idx="${i}">Save</button>
                <button class="admin-delete" data-idx="${i}">Delete</button>
            </div>
        `).join('');
    }
    renderAdminLeaderboard();
    adminLeaderboardList.onclick = function(e) {
        const idx = e.target.dataset.idx;
        if (e.target.classList.contains('admin-edit')) {
            const name = adminLeaderboardList.querySelector(`input[data-type='name'][data-idx='${idx}']`).value;
            const country = adminLeaderboardList.querySelector(`input[data-type='country'][data-idx='${idx}']`).value;
            const wpm = parseInt(adminLeaderboardList.querySelector(`input[data-type='wpm'][data-idx='${idx}']`).value) || 0;
            const accuracy = parseInt(adminLeaderboardList.querySelector(`input[data-type='accuracy'][data-idx='${idx}']`).value) || 0;
            const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            leaderboard[idx] = { ...leaderboard[idx], name, country, wpm, accuracy };
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            renderAdminLeaderboard();
            updateLeaderboard();
        } else if (e.target.classList.contains('admin-delete')) {
            const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            leaderboard.splice(idx, 1);
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            renderAdminLeaderboard();
            updateLeaderboard();
        }
    };
}

// Show admin panel if hash matches
if (window.location.hash === '#admin_is_boss') {
    window.addEventListener('DOMContentLoaded', showAdminPanel);
}

// Initialize the app
init(); 
