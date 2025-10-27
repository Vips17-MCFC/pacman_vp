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
        // Initialize with dots
        maze[y][x] = 2;
    }
}

// Add walls in a Pac-Man style pattern
function addWall(x, y, width, height) {
    for (let i = y; i < y + height && i < GRID_HEIGHT; i++) {
        for (let j = x; j < x + width && j < GRID_WIDTH; j++) {
            if (i >= 0 && j >= 0) {
                maze[i][j] = 1;
            }
        }
    }
}

// Border walls
for (let i = 0; i < GRID_WIDTH; i++) {
    maze[0][i] = 1; // Top wall
    maze[GRID_HEIGHT-1][i] = 1; // Bottom wall
}
for (let i = 0; i < GRID_HEIGHT; i++) {
    maze[i][0] = 1; // Left wall
    maze[i][GRID_WIDTH-1] = 1; // Right wall
}

// Add internal walls
// Top section
addWall(2, 2, 4, 4);
addWall(8, 2, 4, 4);
addWall(14, 2, 4, 4);
addWall(20, 2, 4, 4);
addWall(26, 2, 4, 4);

// Middle section
addWall(2, 8, 4, 4);
addWall(8, 8, 4, 12);
addWall(14, 8, 4, 4);
addWall(20, 8, 4, 12);
addWall(26, 8, 4, 4);

// Bottom section
addWall(2, 22, 4, 4);
addWall(8, 22, 4, 4);
addWall(14, 22, 4, 4);
addWall(20, 22, 4, 4);
addWall(26, 22, 4, 4);

// Add T-shaped walls
addWall(14, 14, 4, 2);
addWall(13, 14, 6, 2);

// Clear starting positions
maze[23][14] = 2; // Pacman starting position
maze[11][14] = 0; // Ghost starting position

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
    // Calculate direction to Pac-Man
    const dx = pacman.x - ghost.x;
    const dy = pacman.y - ghost.y;
    const angle = Math.atan2(dy, dx);
    
    // Try to move towards Pac-Man
    let newX = ghost.x;
    let newY = ghost.y;
    let moved = false;
    
    // Try primary direction (horizontal or vertical based on distance)
    if (Math.abs(dx) > Math.abs(dy)) {
        // Try horizontal movement
        newX = ghost.x + Math.sign(dx) * ghost.speed;
        if (!checkCollision(newX, ghost.y)) {
            ghost.x = newX;
            moved = true;
        }
    } else {
        // Try vertical movement
        newY = ghost.y + Math.sign(dy) * ghost.speed;
        if (!checkCollision(ghost.x, newY)) {
            ghost.y = newY;
            moved = true;
        }
    }
    
    // If primary direction failed, try the other direction
    if (!moved) {
        if (Math.abs(dx) > Math.abs(dy)) {
            // Try vertical movement
            newY = ghost.y + Math.sign(dy) * ghost.speed;
            if (!checkCollision(ghost.x, newY)) {
                ghost.y = newY;
            }
        } else {
            // Try horizontal movement
            newX = ghost.x + Math.sign(dx) * ghost.speed;
            if (!checkCollision(newX, ghost.y)) {
                ghost.x = newX;
            }
        }
    }
    
    // Update ghost direction for eye animation
    ghost.direction = angle;
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