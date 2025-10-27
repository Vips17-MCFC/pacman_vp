// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 600;
canvas.height = 600;

// Game variables
let score = 0;
let lives = 3;
const CELL_SIZE = 20;
const GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE);
const GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

// Game objects
const pacman = {
    x: CELL_SIZE * 14,
    y: CELL_SIZE * 23,
    direction: 0,
    speed: 3,
    radius: CELL_SIZE / 2
};

const ghost = {
    x: CELL_SIZE * 14,
    y: CELL_SIZE * 11,
    direction: 0,
    speed: 2
};

// Create maze layout (1 for walls, 0 for paths, 2 for dots)
const maze = [];
for (let y = 0; y < GRID_HEIGHT; y++) {
    maze[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
        // Border walls
        if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
            maze[y][x] = 1;
        } else {
            // Internal maze structure (simplified)
            if (x % 2 === 0 && y % 2 === 0) {
                maze[y][x] = 1;
            } else {
                maze[y][x] = 2; // Place dots
            }
        }
    }
}

// Game controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (!checkCollision(pacman.x, pacman.y - pacman.speed)) {
                pacman.direction = 1.5 * Math.PI;
            }
            break;
        case 'ArrowDown':
            if (!checkCollision(pacman.x, pacman.y + pacman.speed)) {
                pacman.direction = 0.5 * Math.PI;
            }
            break;
        case 'ArrowLeft':
            if (!checkCollision(pacman.x - pacman.speed, pacman.y)) {
                pacman.direction = Math.PI;
            }
            break;
        case 'ArrowRight':
            if (!checkCollision(pacman.x + pacman.speed, pacman.y)) {
                pacman.direction = 0;
            }
            break;
    }
});

// Collision detection
function checkCollision(x, y) {
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    return maze[gridY][gridX] === 1;
}

// Move ghost
function moveGhost() {
    // Simple ghost AI: move randomly
    if (Math.random() < 0.05) {
        ghost.direction = Math.floor(Math.random() * 4) * (Math.PI / 2);
    }

    const newX = ghost.x + Math.cos(ghost.direction) * ghost.speed;
    const newY = ghost.y + Math.sin(ghost.direction) * ghost.speed;

    if (!checkCollision(newX, newY)) {
        ghost.x = newX;
        ghost.y = newY;
    }
}

// Draw functions
function drawMaze() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#00f';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else if (maze[y][x] === 2) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, pacman.direction + 0.2, pacman.direction + 1.8 * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fillStyle = '#ff0';
    ctx.fill();
}

function drawGhost() {
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, CELL_SIZE/2, 0, Math.PI, true);
    ctx.lineTo(ghost.x - CELL_SIZE/2, ghost.y + CELL_SIZE/2);
    ctx.quadraticCurveTo(ghost.x - CELL_SIZE/3, ghost.y + CELL_SIZE/3,
                        ghost.x - CELL_SIZE/6, ghost.y + CELL_SIZE/2);
    ctx.quadraticCurveTo(ghost.x, ghost.y + CELL_SIZE/3,
                        ghost.x + CELL_SIZE/6, ghost.y + CELL_SIZE/2);
    ctx.quadraticCurveTo(ghost.x + CELL_SIZE/3, ghost.y + CELL_SIZE/3,
                        ghost.x + CELL_SIZE/2, ghost.y + CELL_SIZE/2);
    ctx.lineTo(ghost.x - CELL_SIZE/2, ghost.y + CELL_SIZE/2);
    ctx.fill();
}

// Update game state
function update() {
    // Move Pacman
    const newX = pacman.x + Math.cos(pacman.direction) * pacman.speed;
    const newY = pacman.y + Math.sin(pacman.direction) * pacman.speed;
    
    if (!checkCollision(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
        
        // Collect dots
        const gridX = Math.floor(pacman.x / CELL_SIZE);
        const gridY = Math.floor(pacman.y / CELL_SIZE);
        if (maze[gridY][gridX] === 2) {
            maze[gridY][gridX] = 0;
            score += 10;
            document.getElementById('score').textContent = score;
        }
    }

    // Move ghost
    moveGhost();

    // Check collision with ghost
    const dx = pacman.x - ghost.x;
    const dy = pacman.y - ghost.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < CELL_SIZE) {
        lives--;
        document.getElementById('lives').textContent = lives;
        
        if (lives <= 0) {
            alert('Game Over! Your score: ' + score);
            location.reload();
        } else {
            // Reset positions
            pacman.x = CELL_SIZE * 14;
            pacman.y = CELL_SIZE * 23;
            ghost.x = CELL_SIZE * 14;
            ghost.y = CELL_SIZE * 11;
        }
    }

    // Check win condition
    let dotsRemaining = false;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === 2) {
                dotsRemaining = true;
                break;
            }
        }
        if (dotsRemaining) break;
    }
    
    if (!dotsRemaining) {
        alert('You Win! Your score: ' + score);
        location.reload();
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawMaze();
    drawPacman();
    drawGhost();
    update();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();