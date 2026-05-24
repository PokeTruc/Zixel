// --- STRUCTURE GÉNÉRIQUE ---
let activeGame = null;
let gameInterval = null;
let currentLevel = 1;

function closeGame() {
    if (gameInterval) clearInterval(gameInterval);
    if (activeGame && activeGame.stop) activeGame.stop();
    document.getElementById('game-stage').classList.add('hidden');
    document.getElementById('games-menu').classList.remove('hidden');
    activeGame = null;
}

function startGame(gameId) {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-stage').classList.remove('hidden');
    const content = document.getElementById('game-content');
    content.innerHTML = '';
    
    if (gameId === 'morpion') initMorpion(content);
    if (gameId === 'snake') initSnake(content);
    if (gameId === 'platformer') initPlatformer(content);
    // ... ajouter les autres jeux ici
}

// --- EXEMPLE: SNAKE AVEC NIVEAUX ET BONUS ---
function initSnake(container) {
    const user = getUser(currentUser);
    const slowMode = user.bonuses.snakeSlow;
    const speed = slowMode ? 200 : 150;

    container.innerHTML = `
        <h2>🐍 Snake - Niveau ${currentLevel}</h2>
        <canvas id="snakeCanvas" width="400" height="400"></canvas>
        <p>Score: <span id="snake-score">0</span></p>
        <button class="z-btn" onclick="resetSnake()">Recommencer</button>
    `;

    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    let snake = [{x:10, y:10}], food = {x:15, y:15}, dir='RIGHT', score=0;
    
    function draw() {
        ctx.fillStyle = '#2d3436'; ctx.fillRect(0,0,400,400);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(food.x*20, food.y*20, 18, 18);
        ctx.fillStyle = '#2ecc71';
        snake.forEach(p => ctx.fillRect(p.x*20, p.y*20, 18, 18));
    }

    function update() {
        const head = { ...snake[0] };
        if(dir==='UP') head.y--; if(dir==='DOWN') head.y++;
        if(dir==='LEFT') head.x--; if(dir==='RIGHT') head.x++;

        if(head.x<0 || head.x>19 || head.y<0 || head.y>19 || snake.some(s=>s.x===head.x && s.y===head.y)) {
            alert(`Game Over! Score: ${score}`);
            updateUserStats(currentUser, 'addScore', score);
            updateUserStats(currentUser, 'addXP', score);
            closeGame();
            return;
        }
        snake.unshift(head);
        if(head.x===food.x && head.y===food.y) {
            score+=10;
            document.getElementById('snake-score').textContent = score;
            food = {x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*20)};
        } else {
            snake.pop();
        }
        draw();
    }

    document.onkeydown = (e) => {
        if(e.key==='ArrowUp' && dir!=='DOWN') dir='UP';
        if(e.key==='ArrowDown' && dir!=='UP') dir='DOWN';
        if(e.key==='ArrowLeft' && dir!=='RIGHT') dir='LEFT';
        if(e.key==='ArrowRight' && dir!=='LEFT') dir='RIGHT';
    };

    gameInterval = setInterval(update, speed);
    activeGame = { stop: () => { clearInterval(gameInterval); document.onkeydown=null; } };
}

// --- EXEMPLE: PLATFORMER AVEC NIVEAUX ---
function initPlatformer(container) {
    container.innerHTML = `
        <h2>🏃 Platformer - Niveau ${currentLevel}</h2>
        <canvas id="platCanvas" width="600" height="400"></canvas>
        <p>Vies: <span id="plat-lives">3</span></p>
    `;
    // Logique platformer simplifiée (similaire à l'ancien code)
    // Ajoutez la logique de niveau : si score > X, currentLevel++, reset
}

// --- AUTRES JEUX (Morpion, Memory, etc.) ---
// Copiez les fonctions initMorpion, initMemory, etc. de la version précédente ici.
// Assurez-vous d'appeler updateUserStats à la fin de chaque jeu.

function renderGamesMenu() {
    const list = document.getElementById('games-list');
    const games = [
        {id:'morpion', icon:'⭕', name:'Morpion'},
        {id:'snake', icon:'🐍', name:'Snake'},
        {id:'platformer', icon:'🏃', name:'Platformer'},
        {id:'memory', icon:'🃏', name:'Mémoire'},
        {id:'pfc', icon:'✊', name:'PFC'},
        {id:'guess', icon:'🔢', name:'Devine'},
        {id:'reflex', icon:'⚡', name:'Réflexes'},
        {id:'whack', icon:'🔨', name:'Taupe'},
        {id:'2048', icon:'🔢', name:'2048'}
    ];
    
    list.innerHTML = games.map(g => `
        <div class="game-card" onclick="startGame('${g.id}')">
            <div class="game-icon">${g.icon}</div>
            <div class="game-name">${g.name}</div>
        </div>
    `).join('');
}