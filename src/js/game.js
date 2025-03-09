// Game constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const PLAYER_SPEED = 5;
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 32;

// Visual effects constants
const EXPLOSION_DURATION = 500; // milliseconds
const EXPLOSION_PARTICLES = 15;
const EXPLOSION_COLORS = ['#FF4400', '#FF8800', '#FFCC00'];
const HIT_FLASH_DURATION = 200;
const GAME_OVER_TEXT_SIZE = 72;

// Environment constants
const WATER_START = CANVAS_HEIGHT * 1/3; // Where water begins (1/3 from top)
const WATER_COLOR = '#000066';
const AIR_COLOR = '#87CEEB';

// Ship constants
const SHIP_FLOAT_HEIGHT = PLAYER_HEIGHT * 2/3; // How much of the ship can enter the air

// Weapon constants
const CANNON_SPEED = 10;
const CANNON_SIZE = 4;
const CANNON_COLOR = '#FF4400';
const CANNON_COOLDOWN = 250; // Milliseconds between shots

// Missile constants
const MISSILE_SPEED = 10; // Reduced speed for better balance
const MISSILE_SIZE = 8;
const MISSILE_COLOR = '#00FFFF';
const MISSILE_DAMAGE = 50;
const MISSILE_MAX_COUNT = 16;
const MISSILE_LOCK_TIME = 100; // 0.1 seconds for lock
const MISSILE_TURN_SPEED = 10.0; // Ultra-extreme agility for guaranteed air target interception
const MISSILE_MIN_DISTANCE = 5; // Minimum distance to consider a hit

// Collision constants
const COLLISION_DAMAGE = 10;

// Enemy constants
const ENEMY_WIDTH = 48;
const ENEMY_HEIGHT = 24;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 3000; // Spawn every 3 seconds
const ENEMY_HEALTH = 30;
const ENEMY_COLOR = '#FF0000';
const ENEMY_SHOT_INTERVAL = 2000; // Shoot every 2 seconds
const ENEMY_PROJECTILE_SPEED = 8;
const ENEMY_PROJECTILE_COLOR = '#FFFF00'; // Yellow for enemy projectiles

// Aircraft constants
const AIRCRAFT_WIDTH = 40;
const AIRCRAFT_HEIGHT = 20;
const AIRCRAFT_SPEED = 3;
const AIRCRAFT_HEALTH = 20;
const AIRCRAFT_COLOR = '#8B4513';
const AIRCRAFT_SHOT_INTERVAL = 1500; // Shoot faster than ships
const AIRCRAFT_VERTICAL_SPEED = 1;
const AIRCRAFT_SPAWN_INTERVAL = 4000; // Spawn every 4 seconds

// Score constants
const SCORE_BASIC_ENEMY = 1;  // Points for destroying basic enemies
const MAX_HIGH_SCORES = 10;   // Number of high scores to track
const NAME_MAX_LENGTH = 8;    // Increased from 3 to 8 characters for names

// Add touch control constants after other constants
const MOBILE_SETTINGS = {
    hapticFeedback: true,
    buttonOpacity: 0.3,
    activeButtonOpacity: 0.5,
    minimumTouchSize: 48, // Minimum 48x48px touch target
    doubleTapTimeout: 300 // ms between taps
};

// Update touch control constants
const TOUCH_CONTROLS = {
    enabled: false,
    buttonSize: Math.max(60, MOBILE_SETTINGS.minimumTouchSize),
    buttonPadding: 10,
    buttonColor: `rgba(255, 255, 255, ${MOBILE_SETTINGS.buttonOpacity})`,
    buttonActiveColor: `rgba(255, 255, 255, ${MOBILE_SETTINGS.activeButtonOpacity})`,
    fireButtonColor: `rgba(255, 0, 0, ${MOBILE_SETTINGS.buttonOpacity})`,
    fireButtonActiveColor: `rgba(255, 0, 0, ${MOBILE_SETTINGS.activeButtonOpacity})`,
    missileButtonColor: `rgba(0, 255, 255, ${MOBILE_SETTINGS.buttonOpacity})`,
    missileButtonActiveColor: `rgba(0, 255, 255, ${MOBILE_SETTINGS.activeButtonOpacity})`
};

// Add virtual keyboard constants after touch controls
const VIRTUAL_KEYBOARD = {
    enabled: false,
    keys: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ],
    keySize: 40,
    padding: 5,
    color: 'rgba(255, 255, 255, 0.3)',
    activeColor: 'rgba(255, 255, 255, 0.5)',
    textColor: '#FFFFFF'
};

// High Score Service for managing scores
const HighScoreService = {
    scores: [],
    storageKey: 'highScores',
    maxScores: MAX_HIGH_SCORES,

    async init() {
        try {
            // Load scores from localStorage
            const savedScores = localStorage.getItem(this.storageKey);
            this.scores = savedScores ? JSON.parse(savedScores) : [];
            return true;
        } catch (error) {
            console.error('Failed to initialize high scores:', error);
            this.scores = [];
            return false;
        }
    },

    async loadHighScores() {
        return this.scores;
    },

    async saveHighScore(name, score) {
        // Add new score
        this.scores.push({ name, score });
        
        // Sort by score (descending)
        this.scores.sort((a, b) => b.score - a.score);
        
        // Keep only top scores
        this.scores = this.scores.slice(0, this.maxScores);
        
        // Save to storage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
            return true;
        } catch (error) {
            console.error('Failed to save high score:', error);
            return false;
        }
    },

    async clearHighScores() {
        try {
            this.scores = [];
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear high scores:', error);
            return false;
        }
    }
};

// Game variables
let canvas;
let ctx;
let mouse = { x: 0, y: 0 };
let lastShotTime = 0;
let lastEnemySpawnTime = 0;
let lastAircraftSpawnTime = 0;
let isMouseDown = false;
let projectiles = [];
let enemyProjectiles = [];
let enemies = [];
let aircraft = [];
let missiles = [];
let missileCount = MISSILE_MAX_COUNT;
let lockOnTarget = null;
let lockStartTime = 0;
let explosions = [];
let hitFlashes = [];
let gameOver = false;
let score = 0;  // Track player's score
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];  // Load high scores from storage
let isEnteringName = true;   // Start with name entry
let playerName = '';          // Current player name
let gameStarted = false;     // Track if game has started
let nameBlinkTimer = 0;       // For blinking cursor effect

// Add touch state tracking
let touchControls = {
    up: { pressed: false, x: 0, y: 0, width: 0, height: 0 },
    down: { pressed: false, x: 0, y: 0, width: 0, height: 0 },
    left: { pressed: false, x: 0, y: 0, width: 0, height: 0 },
    right: { pressed: false, x: 0, y: 0, width: 0, height: 0 },
    fire: { pressed: false, x: 0, y: 0, width: 0, height: 0 },
    missile: { pressed: false, x: 0, y: 0, width: 0, height: 0 }
};

let player = {
    x: 50,
    y: CANVAS_HEIGHT * 2/3, // Start in the middle of water section
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    health: 100,
    moving: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    missiles: MISSILE_MAX_COUNT,
    isHit: false,
    hitTime: 0
};

// Add after game variables
let targetingAngle = 0; // Angle in radians, 0 points right
const TARGETING_SPEED = 0.05; // Speed of targeting vector rotation
const TARGETING_LENGTH = CANVAS_WIDTH; // Maximum length of targeting vector

// Initialize the game
async function init() {
    try {
        // Check orientation first
        if (window.innerWidth < window.innerHeight) {
            return; // Don't initialize in portrait mode
        }
        
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Check if device supports touch
        TOUCH_CONTROLS.enabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        VIRTUAL_KEYBOARD.enabled = TOUCH_CONTROLS.enabled;
        
        // Make canvas responsive
        resizeCanvas();
        window.addEventListener('resize', function() {
            if (window.innerWidth > window.innerHeight) {
                resizeCanvas();
            }
        });
        
        // Initialize high score service and load scores
        await HighScoreService.init();
        await loadHighScores();
        
        // Add event listeners
        setupControls();
        
        // Hide cursor during gameplay, show during name entry
        updateCursorVisibility();
        
        // Start the game loop
        gameLoop();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '24px Arial';
            ctx.fillText('Failed to initialize game. Please refresh.', 50, 50);
        }
    }
}

// Update resizeCanvas function
function resizeCanvas() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    
    let newWidth, newHeight;
    
    // Only handle landscape mode
    if (containerWidth > containerHeight) {
        if (containerHeight * aspectRatio <= containerWidth) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        } else {
            newWidth = containerWidth;
            newHeight = containerWidth / aspectRatio;
        }
        
        // Set canvas size
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // Update touch control positions
        if (TOUCH_CONTROLS.enabled) {
            setupTouchControls();
        }
    }
}

// Add touch control setup
function setupTouchControls() {
    const size = TOUCH_CONTROLS.buttonSize;
    const padding = TOUCH_CONTROLS.buttonPadding;
    
    // D-pad on left side
    touchControls.left.x = padding;
    touchControls.left.y = CANVAS_HEIGHT - size * 2;
    touchControls.right.x = padding + size * 2;
    touchControls.right.y = CANVAS_HEIGHT - size * 2;
    touchControls.up.x = padding + size;
    touchControls.up.y = CANVAS_HEIGHT - size * 3;
    touchControls.down.x = padding + size;
    touchControls.down.y = CANVAS_HEIGHT - size;
    
    // Action buttons on right side
    touchControls.fire.x = CANVAS_WIDTH - padding - size * 2;
    touchControls.fire.y = CANVAS_HEIGHT - size * 2;
    touchControls.missile.x = CANVAS_WIDTH - padding - size;
    touchControls.missile.y = CANVAS_HEIGHT - size * 3;
    
    // Set sizes for all buttons
    Object.values(touchControls).forEach(button => {
        button.width = size;
        button.height = size;
    });
}

// Update setupControls function
function setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (isEnteringName) {
            handleNameEntry(e.key);
            e.preventDefault();  // Prevent scrolling with spacebar
        } else if (gameOver && e.key.toLowerCase() === 'r') {
            resetGame();
        } else {
            updateMovement(e.key, true);
        }
    });
    
    window.addEventListener('keyup', (e) => {
        updateMovement(e.key, false);
    });
    
    // Mouse controls
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        mouse.x = (e.clientX - rect.left) * scaleX;
        mouse.y = (e.clientY - rect.top) * scaleY;
    });
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click
            isMouseDown = true;
            fireCannon(); // Fire immediately when pressed
        } else if (e.button === 2 && lockOnTarget && player.missiles > 0) { // Right click
            fireMissile(lockOnTarget);
            player.missiles--;
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isMouseDown = false;
        }
    });
    
    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Handle mouse leaving the canvas
    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });
    
    if (TOUCH_CONTROLS.enabled) {
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);
    }
    
    // Add event listener for cursor visibility
    document.addEventListener('mouseover', () => {
        if (!isEnteringName) {
            updateCursorVisibility();
        }
    });
}

// Update cursor visibility based on game state
function updateCursorVisibility() {
    const cursorStyle = isEnteringName ? 'default' : 'none';
    
    // Update cursor style on multiple levels to ensure it's hidden
    if (canvas) {
        canvas.style.cursor = cursorStyle;
    }
    document.body.style.cursor = cursorStyle;
    document.documentElement.style.cursor = cursorStyle;
    
    // Update all elements if we're hiding the cursor
    if (!isEnteringName) {
        const elements = document.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.cursor = 'none';
        }
    }
}

// Update player movement state
function updateMovement(key, isPressed) {
    switch(key.toLowerCase()) {  // Convert to lowercase to handle both cases
        case 'arrowup':
        case 'w':
            player.moving.up = isPressed;
            break;
        case 'arrowdown':
        case 's':
            player.moving.down = isPressed;
            break;
        case 'arrowleft':
        case 'a':
            player.moving.left = isPressed;
            break;
        case 'arrowright':
        case 'd':
            player.moving.right = isPressed;
            break;
    }
}

// Fire cannon
function fireCannon() {
    const currentTime = Date.now();
    if (currentTime - lastShotTime < CANNON_COOLDOWN) return;
    
    const shipCenter = {
        x: player.x + player.width,
        y: player.y + player.height / 2
    };
    
    // Calculate direction to mouse position
    const dx = mouse.x - shipCenter.x;
    const dy = mouse.y - shipCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    projectiles.push({
        x: shipCenter.x,
        y: shipCenter.y,
        dx: normalizedDx * CANNON_SPEED,
        dy: normalizedDy * CANNON_SPEED,
        size: CANNON_SIZE
    });
    
    lastShotTime = currentTime;
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check collision between a circle and a rectangle
function checkCircleRectCollision(circle, rect) {
    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    
    // If the distance is less than the circle's radius, an intersection occurs
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circle.radius * circle.radius);
}

// Spawn a new enemy ship
function spawnEnemy() {
    const minY = WATER_START - SHIP_FLOAT_HEIGHT;
    const maxY = CANVAS_HEIGHT - ENEMY_HEIGHT;
    const randomY = Math.random() * (maxY - minY) + minY;
    
    enemies.push({
        x: CANVAS_WIDTH,
        y: randomY,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: ENEMY_SPEED,
        health: ENEMY_HEALTH,
        lastShotTime: 0
    });
}

// Enemy fires at player
function enemyShoot(enemy) {
    const currentTime = Date.now();
    if (currentTime - enemy.lastShotTime < ENEMY_SHOT_INTERVAL) return;
    
    const enemyCenter = {
        x: enemy.x,
        y: enemy.y + enemy.height / 2
    };
    
    // Calculate direction to player
    const dx = player.x - enemyCenter.x;
    const dy = (player.y + player.height / 2) - enemyCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    enemyProjectiles.push({
        x: enemyCenter.x,
        y: enemyCenter.y,
        dx: normalizedDx * ENEMY_PROJECTILE_SPEED,
        dy: normalizedDy * ENEMY_PROJECTILE_SPEED,
        size: CANNON_SIZE
    });
    
    enemy.lastShotTime = currentTime;
}

// Spawn a new aircraft
function spawnAircraft() {
    const minY = 20; // Some padding from top
    const maxY = WATER_START - AIRCRAFT_HEIGHT - 20; // Some padding from water
    const randomY = Math.random() * (maxY - minY) + minY;
    
    aircraft.push({
        x: CANVAS_WIDTH,
        y: randomY,
        width: AIRCRAFT_WIDTH,
        height: AIRCRAFT_HEIGHT,
        speed: AIRCRAFT_SPEED,
        verticalSpeed: AIRCRAFT_VERTICAL_SPEED,
        health: AIRCRAFT_HEALTH,
        lastShotTime: 0,
        movingDown: Math.random() < 0.5 // Random initial vertical direction
    });
}

// Aircraft fires at player
function aircraftShoot(aircraft) {
    const currentTime = Date.now();
    if (currentTime - aircraft.lastShotTime < AIRCRAFT_SHOT_INTERVAL) return;
    
    const aircraftCenter = {
        x: aircraft.x,
        y: aircraft.y + aircraft.height / 2
    };
    
    // Calculate direction to player
    const dx = player.x - aircraftCenter.x;
    const dy = (player.y + player.height / 2) - aircraftCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    enemyProjectiles.push({
        x: aircraftCenter.x,
        y: aircraftCenter.y,
        dx: normalizedDx * ENEMY_PROJECTILE_SPEED,
        dy: normalizedDy * ENEMY_PROJECTILE_SPEED,
        size: CANNON_SIZE
    });
    
    aircraft.lastShotTime = currentTime;
}

// Update game state
function update() {
    if (isEnteringName) return;  // Don't update game if entering name
    
    if (gameOver) {
        return;
    }

    // Check for game over condition
    if (player.health <= 0) {
        gameOver = true;
        if (score > 0) {  // Only add score if greater than 0
            addHighScore(playerName, score);  // Automatically add score
        }
        return;
    }

    // Store previous position for collision check
    const prevY = player.y;
    
    // Update player position based on movement state
    if (player.moving.up) {
        const newY = player.y - player.speed;
        // Only allow upward movement if we're not going too high above water
        if (newY >= WATER_START - SHIP_FLOAT_HEIGHT) {
            player.y = newY;
        }
    }
    if (player.moving.down) {
        const newY = player.y + player.speed;
        // Check bottom boundary before moving
        if (newY <= CANVAS_HEIGHT - player.height) {
            player.y = newY;
        }
    }
    if (player.moving.left) {
        const newX = player.x - player.speed;
        if (newX >= 0) {
            player.x = newX;
        }
    }
    if (player.moving.right) {
        const newX = player.x + player.speed;
        if (newX <= CANVAS_WIDTH - player.width) {
            player.x = newX;
        }
    }
    
    // Remove redundant boundary checks since we're checking before moving
    // Keep only the water line check as a safety
    if (player.y < WATER_START - SHIP_FLOAT_HEIGHT) {
        player.y = WATER_START - SHIP_FLOAT_HEIGHT;
    }
    
    // Check if we should fire cannon (continuous fire when mouse is held)
    if (isMouseDown) {
        fireCannon();
    }
    
    // Spawn enemies
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        spawnEnemy();
        lastEnemySpawnTime = currentTime;
    }
    if (currentTime - lastAircraftSpawnTime > AIRCRAFT_SPAWN_INTERVAL) {
        spawnAircraft();
        lastAircraftSpawnTime = currentTime;
    }
    
    // Update projectiles
    projectiles = projectiles.filter(projectile => {
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        
        const isOnScreen = projectile.x >= 0 && 
                         projectile.x <= CANVAS_WIDTH && 
                         projectile.y >= 0 && 
                         projectile.y <= CANVAS_HEIGHT;
        
        if (!isOnScreen) return false;
        
        // Check collisions with enemies and aircraft
        let hasHit = false;
        
        enemies.forEach(enemy => {
            if (checkCircleRectCollision(
                { x: projectile.x, y: projectile.y, radius: projectile.size },
                enemy
            )) {
                enemy.health -= COLLISION_DAMAGE;
                createHitFlash(enemy);
                if (enemy.health <= 0) {
                    score += SCORE_BASIC_ENEMY;  // Add score for destroying enemy ship
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                }
                hasHit = true;
            }
        });
        
        aircraft.forEach(plane => {
            if (checkCircleRectCollision(
                { x: projectile.x, y: projectile.y, radius: projectile.size },
                plane
            )) {
                plane.health -= COLLISION_DAMAGE;
                createHitFlash(plane);
                if (plane.health <= 0) {
                    score += SCORE_BASIC_ENEMY;  // Add score for destroying aircraft
                    createExplosion(plane.x + plane.width/2, plane.y + plane.height/2);
                }
                hasHit = true;
            }
        });
        
        return !hasHit;
    });
    
    // Update enemy projectiles
    enemyProjectiles = enemyProjectiles.filter(projectile => {
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        
        const isOnScreen = projectile.x >= 0 && 
                         projectile.x <= CANVAS_WIDTH && 
                         projectile.y >= 0 && 
                         projectile.y <= CANVAS_HEIGHT;
        
        if (!isOnScreen) return false;
        
        // Check collision with player
        if (checkCircleRectCollision(
            { x: projectile.x, y: projectile.y, radius: projectile.size },
            player
        )) {
            player.health -= COLLISION_DAMAGE;
            player.isHit = true;
            player.hitTime = Date.now();
            createHitFlash(player);
            return false;
        }
        
        return true;
    });
    
    // Update aircraft
    aircraft = aircraft.filter(plane => {
        // Move horizontally
        plane.x -= plane.speed;
        
        // Move vertically in a wave pattern
        if (plane.movingDown) {
            plane.y += plane.verticalSpeed;
            if (plane.y > WATER_START - AIRCRAFT_HEIGHT - 20) {
                plane.movingDown = false;
            }
        } else {
            plane.y -= plane.verticalSpeed;
            if (plane.y < 20) {
                plane.movingDown = true;
            }
        }
        
        // Try to shoot at player
        aircraftShoot(plane);
        
        // Remove if off screen
        if (plane.x + plane.width < 0) return false;
        
        // Check collision with player
        if (checkCollision(plane, player)) {
            player.health -= COLLISION_DAMAGE;
            createHitFlash(player);
            createExplosion(plane.x + plane.width/2, plane.y + plane.height/2);
            return false;
        }
        
        return plane.health > 0;
    });
    
    // Update enemies
    enemies = enemies.filter(enemy => {
        // Move enemy
        enemy.x -= enemy.speed;
        
        // Try to shoot at player
        enemyShoot(enemy);
        
        // Remove if off screen
        if (enemy.x + enemy.width < 0) return false;
        
        // Check collision with player
        if (checkCollision(enemy, player)) {
            player.health -= COLLISION_DAMAGE;
            createHitFlash(player);
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            return false;
        }
        
        return enemy.health > 0;
    });
    
    // Update missiles
    missiles = missiles.filter(missile => {
        if (!missile.target || missile.target.health <= 0) {
            createExplosion(missile.x, missile.y); // Explode if target is lost
            return false;
        }
        
        // Calculate direction to target's center
        const targetCenter = {
            x: missile.target.x + missile.target.width/2,
            y: missile.target.y + missile.target.height/2
        };
        
        const dx = targetCenter.x - missile.x;
        const dy = targetCenter.y - missile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if missile has reached target
        if (distance < MISSILE_MIN_DISTANCE || checkCircleRectCollision(
            { x: missile.x, y: missile.y, radius: MISSILE_SIZE },
            missile.target
        )) {
            missile.target.health -= MISSILE_DAMAGE;
            createHitFlash(missile.target);
            createExplosion(missile.x, missile.y);
            if (missile.target.health <= 0) {
                score += SCORE_BASIC_ENEMY;  // Add score for destroying enemy with missile
                createExplosion(targetCenter.x, targetCenter.y);
            }
            return false;
        }
        
        // Update missile direction (homing effect)
        const targetDx = dx / distance;
        const targetDy = dy / distance;
        
        // Direct velocity adjustment without normalization
        missile.dx = targetDx * MISSILE_SPEED;
        missile.dy = targetDy * MISSILE_SPEED;
        
        // Move missile
        missile.x += missile.dx;
        missile.y += missile.dy;
        
        // Check if missile is off screen
        if (missile.x < 0 || missile.x > CANVAS_WIDTH || 
            missile.y < 0 || missile.y > CANVAS_HEIGHT) {
            createExplosion(missile.x, missile.y); // Explode if off screen
            return false;
        }
        
        return true;
    });
    
    // Check for missile lock-on
    const now = Date.now();
    let potentialTarget = null;
    
    // Check aircraft first (prioritize air targets)
    for (const plane of aircraft) {
        if (isTargetUnderCrosshair(plane)) {
            potentialTarget = plane;
            break;
        }
    }
    
    // If no aircraft found, check ships
    if (!potentialTarget) {
        for (const ship of enemies) {
            if (isTargetUnderCrosshair(ship)) {
                potentialTarget = ship;
                break;
            }
        }
    }
    
    // Handle lock-on timing
    if (potentialTarget) {
        if (potentialTarget === lockOnTarget) {
            if (now - lockStartTime >= MISSILE_LOCK_TIME) {
                // Target is locked on - but don't fire automatically
                lockOnTarget = potentialTarget;
            }
        } else {
            lockOnTarget = potentialTarget;
            lockStartTime = now;
        }
    } else {
        lockOnTarget = null;
    }

    // Update explosions
    explosions = explosions.filter(particles => {
        particles.forEach(particle => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life -= 16; // Assuming 60 FPS
        });
        return particles.some(particle => particle.life > 0);
    });

    // Update hit flashes
    hitFlashes = hitFlashes.filter(flash => {
        flash.duration -= 16;
        return flash.duration > 0;
    });

    if (TOUCH_CONTROLS.enabled) {
        // Update player movement based on touch controls
        player.moving.up = touchControls.up.pressed;
        player.moving.down = touchControls.down.pressed;
        player.moving.left = touchControls.left.pressed;
        player.moving.right = touchControls.right.pressed;
    }
}

// Check if target is under crosshair
function isTargetUnderCrosshair(target) {
    return mouse.x >= target.x && mouse.x <= target.x + target.width &&
           mouse.y >= target.y && mouse.y <= target.y + target.height;
}

// Fire missile at target
function fireMissile(target) {
    const shipCenter = {
        x: player.x + player.width,
        y: player.y + player.height / 2
    };
    
    // Calculate initial direction to target
    const dx = target.x - shipCenter.x;
    const dy = target.y - shipCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    missiles.push({
        x: shipCenter.x,
        y: shipCenter.y,
        dx: (dx / distance) * MISSILE_SPEED,
        dy: (dy / distance) * MISSILE_SPEED,
        target: target
    });
}

// Draw environment
function drawEnvironment() {
    // Draw air (sky)
    ctx.fillStyle = AIR_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, WATER_START);
    
    // Draw water
    ctx.fillStyle = WATER_COLOR;
    ctx.fillRect(0, WATER_START, CANVAS_WIDTH, CANVAS_HEIGHT - WATER_START);
}

// Draw targeting vector
function drawTargetingVector() {
    const shipCenter = {
        x: player.x + player.width,
        y: player.y + player.height / 2
    };
    
    // Calculate targeting vector end point
    let endX = mouse.x;
    let endY = mouse.y;
    let targetFound = false;
    
    // Check for intersection with enemies
    for (const enemy of [...enemies, ...aircraft]) {
        const intersection = rayBoxIntersection(
            shipCenter,
            { 
                x: (mouse.x - shipCenter.x) / TARGETING_LENGTH,
                y: (mouse.y - shipCenter.y) / TARGETING_LENGTH
            },
            enemy
        );
        
        if (intersection) {
            endX = intersection.x;
            endY = intersection.y;
            lockOnTarget = enemy;
            targetFound = true;
            break;
        }
    }
    
    if (!targetFound) {
        lockOnTarget = null;
    }
    
    // Draw targeting vector
    ctx.beginPath();
    ctx.moveTo(shipCenter.x, shipCenter.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lockOnTarget ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw lock-on indicator if target found
    if (lockOnTarget) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.strokeRect(
            lockOnTarget.x - 2,
            lockOnTarget.y - 2,
            lockOnTarget.width + 4,
            lockOnTarget.height + 4
        );
    }

    // Draw crosshair
    const crosshairSize = 10;
    const lineWidth = 2;
    
    ctx.strokeStyle = lockOnTarget ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = lineWidth;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(mouse.x - crosshairSize, mouse.y);
    ctx.lineTo(mouse.x + crosshairSize, mouse.y);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y - crosshairSize);
    ctx.lineTo(mouse.x, mouse.y + crosshairSize);
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = lockOnTarget ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
}

// Draw projectiles
function drawProjectiles() {
    // Draw player projectiles
    ctx.fillStyle = CANNON_COLOR;
    projectiles.forEach(projectile => {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw enemy projectiles
    ctx.fillStyle = ENEMY_PROJECTILE_COLOR;
    enemyProjectiles.forEach(projectile => {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw enemies
function drawEnemies() {
    ctx.fillStyle = ENEMY_COLOR;
    enemies.forEach(enemy => {
        const isFlashing = hitFlashes.some(flash => flash.target === enemy);
        ctx.fillStyle = isFlashing ? '#FFFFFF' : ENEMY_COLOR;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Draw aircraft
function drawAircraft() {
    ctx.fillStyle = AIRCRAFT_COLOR;
    aircraft.forEach(plane => {
        const isFlashing = hitFlashes.some(flash => flash.target === plane);
        ctx.fillStyle = isFlashing ? '#FFFFFF' : AIRCRAFT_COLOR;
        ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
    });
}

// Draw missiles
function drawMissiles() {
    ctx.fillStyle = MISSILE_COLOR;
    missiles.forEach(missile => {
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, MISSILE_SIZE, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw game objects
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isEnteringName) {
        drawNameEntry();
        return;
    }
    
    // Draw environment first
    drawEnvironment();
    
    // Draw enemies with hit flash effect
    drawEnemies();
    drawAircraft();
    
    // Draw targeting vector
    drawTargetingVector();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw missiles
    drawMissiles();
    
    // Draw player with hit flash effect
    const isPlayerFlashing = hitFlashes.some(flash => flash.target === player);
    ctx.fillStyle = isPlayerFlashing ? '#FFFFFF' : '#00FF00';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y + player.height/2);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw explosions
    explosions.forEach(particles => {
        particles.forEach(particle => {
            const alpha = particle.life / EXPLOSION_DURATION;
            ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    // Draw UI elements
    drawUI();
    
    // Draw game over screen if needed
    if (gameOver) {
        drawGameOver();
    }

    // Draw touch controls if enabled
    if (TOUCH_CONTROLS.enabled && !isEnteringName && !gameOver) {
        drawTouchControls();
    }
}

// Draw UI elements
function drawUI() {
    // Health bar background
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthPercentage = player.health / 100;
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(10, 10, healthBarWidth, healthBarHeight);
    
    // Health bar fill
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(10, 10, healthBarWidth * healthPercentage, healthBarHeight);
    
    // Health text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(`Health: ${Math.max(0, Math.floor(player.health))}`, 15, 25);
    
    // Missile count
    ctx.fillText(`Missiles: ${player.missiles}`, 15, 45);
    
    // Score display
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 15, 25);
    ctx.textAlign = 'left';  // Reset text alignment
}

// Draw name entry screen
function drawNameEntry() {
    // Draw background
    ctx.fillStyle = AIR_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BATTLESHIPS', CANVAS_WIDTH/2, CANVAS_HEIGHT/4);
    
    // Draw name entry interface
    ctx.font = '30px Arial';
    ctx.fillText('Enter Your Name:', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 40);
    
    // Draw name entry box
    const boxWidth = 300;
    const boxHeight = 60;
    const boxX = CANVAS_WIDTH/2 - boxWidth/2;
    const boxY = CANVAS_HEIGHT/2;
    
    // Draw box background
    ctx.fillStyle = '#000033';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw name with blinking cursor
    const displayName = playerName + (Math.floor(Date.now() / 500) % 2 ? '_' : ' ');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px "Courier New"';  // Monospace font for arcade feel
    ctx.fillText(displayName.padEnd(NAME_MAX_LENGTH, '.'), CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 40);
    
    ctx.font = '20px Arial';
    ctx.fillText('Use A-Z and 0-9 • Press ENTER to Start', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 90);
    
    // Draw virtual keyboard if enabled
    if (VIRTUAL_KEYBOARD.enabled) {
        drawVirtualKeyboard();
        
        // Add touch-friendly buttons
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 20;
        const totalWidth = buttonWidth * 2 + buttonSpacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2;
        const startY = CANVAS_HEIGHT - 80;
        
        // Draw Backspace button
        ctx.fillStyle = TOUCH_CONTROLS.buttonColor;
        ctx.fillRect(startX, startY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Backspace', startX + buttonWidth/2, startY + buttonHeight/2 + 7);
        
        // Draw Enter button
        ctx.fillStyle = playerName.length > 0 ? '#00FF00' : TOUCH_CONTROLS.buttonColor;
        ctx.fillRect(startX + buttonWidth + buttonSpacing, startY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(startX + buttonWidth + buttonSpacing, startY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Enter', startX + buttonWidth + buttonSpacing + buttonWidth/2, startY + buttonHeight/2 + 7);
    }
}

// Draw game over screen
function drawGameOver() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Game Over text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${GAME_OVER_TEXT_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/4);
    
    // Display final score
    ctx.font = '36px Arial';
    ctx.fillText(`${playerName}'s Score: ${score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/4 + 60);
    
    // Draw high scores
    ctx.font = '30px Arial';
    ctx.fillText('High Scores', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
    
    ctx.font = '24px Arial';
    const scoreAreaWidth = 400;
    const startX = CANVAS_WIDTH/2 - scoreAreaWidth/2;
    const scoreX = CANVAS_WIDTH/2 + scoreAreaWidth/2;
    
    highScores.slice(0, MAX_HIGH_SCORES).forEach((entry, index) => {
        const y = CANVAS_HEIGHT/2 + 30 + (index * 30);
        ctx.textAlign = 'left';
        ctx.fillText(`${index + 1}. ${entry.name}`, startX, y);
        ctx.textAlign = 'right';
        ctx.fillText(entry.score.toString().padStart(6, '0'), scoreX, y);
    });
    
    // Draw restart button
    const buttonWidth = 200;
    const buttonHeight = 60; // Increased height for better touch target
    const buttonX = CANVAS_WIDTH/2 - buttonWidth/2;
    const buttonY = CANVAS_HEIGHT - 100;
    
    // Button shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(buttonX + 2, buttonY + 2, buttonWidth, buttonHeight);
    
    // Button background with gradient
    const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    gradient.addColorStop(0, '#00FF00');
    gradient.addColorStop(1, '#008800');
    ctx.fillStyle = gradient;
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text with shadow
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Restart Game', CANVAS_WIDTH/2, buttonY + buttonHeight/2);
    
    // Store button coordinates for touch detection
    gameOver.restartButton = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

// Handle name entry for high score
function handleNameEntry(key) {
    if (!isEnteringName) return;
    
    if (key === 'Enter' || key === 'NumpadEnter') {  // Support both Enter keys
        if (playerName.length > 0) {
            isEnteringName = false;  // Exit name entry mode
            gameStarted = true;      // Start the game
        }
    } else if (key === 'Backspace') {
        playerName = playerName.slice(0, -1);
    } else if (key.length === 1 && playerName.length < NAME_MAX_LENGTH) {
        // Allow letters and numbers
        const char = key.toUpperCase();
        if (char.match(/[A-Z0-9]/)) {  // Allow letters and numbers
            playerName += char;
        }
    }
}

// Add score to high scores
async function addHighScore(name, score) {
    await HighScoreService.saveHighScore(name, score);
    highScores = await HighScoreService.loadHighScores();
}

// Load high scores
async function loadHighScores() {
    highScores = await HighScoreService.loadHighScores();
}

// Reset game state
function resetGame() {
    player.health = 100;
    player.missiles = MISSILE_MAX_COUNT;
    player.x = 50;
    player.y = CANVAS_HEIGHT * 2/3;
    
    projectiles = [];
    enemyProjectiles = [];
    enemies = [];
    aircraft = [];
    missiles = [];
    explosions = [];
    hitFlashes = [];
    score = 0;  // Reset score
    
    isEnteringName = true;  // Go back to name entry
    playerName = '';        // Clear the name
    gameStarted = false;    // Reset game started flag
    gameOver = false;
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.addEventListener('load', init);

// Create explosion effect
function createExplosion(x, y) {
    const particles = [];
    for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
        const angle = (Math.PI * 2 / EXPLOSION_PARTICLES) * i;
        const speed = 2 + Math.random() * 2;
        particles.push({
            x,
            y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)],
            life: EXPLOSION_DURATION
        });
    }
    explosions.push(particles);
}

// Create hit flash effect
function createHitFlash(target) {
    hitFlashes.push({
        target,
        duration: HIT_FLASH_DURATION
    });
}

// Update handleTouchStart function
function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    Array.from(e.touches).forEach(touch => {
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        if (gameOver && gameOver.restartButton) {
            const button = gameOver.restartButton;
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                resetGame();
                triggerHapticFeedback(50);
                return;
            }
        }
        
        if (isEnteringName && VIRTUAL_KEYBOARD.enabled) {
            handleVirtualKeyboardTouch(x, y);
            triggerHapticFeedback(25);
        } else {
            // Existing touch control handling...
            Object.entries(touchControls).forEach(([key, button]) => {
                if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height) {
                    button.pressed = true;
                    if (key === 'fire') {
                        isMouseDown = true;
                        triggerHapticFeedback(50);
                    } else if (key === 'missile' && lockOnTarget && player.missiles > 0) {
                        fireMissile(lockOnTarget);
                        player.missiles--;
                        triggerHapticFeedback(100);
                    }
                }
            });
            
            // Update aim position for non-button touches
            if (!Object.values(touchControls).some(button => button.pressed)) {
                mouse.x = x;
                mouse.y = y;
            }
        }
    });
}

// Add virtual keyboard touch handling
function handleVirtualKeyboardTouch(x, y) {
    const keySize = Math.max(VIRTUAL_KEYBOARD.keySize, MOBILE_SETTINGS.minimumTouchSize);
    const padding = VIRTUAL_KEYBOARD.padding;
    const startY = CANVAS_HEIGHT/2 + 120;
    
    let keyPressed = false;
    
    // Check keyboard keys
    VIRTUAL_KEYBOARD.keys.forEach((row, rowIndex) => {
        const rowWidth = row.length * (keySize + padding) - padding;
        const startX = (CANVAS_WIDTH - rowWidth) / 2;
        
        row.forEach((key, keyIndex) => {
            const keyX = startX + keyIndex * (keySize + padding);
            const keyY = startY + rowIndex * (keySize + padding);
            
            if (x >= keyX && x < keyX + keySize &&
                y >= keyY && y < keyY + keySize) {
                if (playerName.length < NAME_MAX_LENGTH) {
                    playerName += key;
                    keyPressed = true;
                }
            }
        });
    });
    
    // Check special buttons
    const buttonWidth = Math.max(120, MOBILE_SETTINGS.minimumTouchSize);
    const buttonHeight = Math.max(40, MOBILE_SETTINGS.minimumTouchSize);
    const buttonSpacing = 20;
    const totalWidth = buttonWidth * 2 + buttonSpacing;
    const buttonsStartX = (CANVAS_WIDTH - totalWidth) / 2;
    const buttonsStartY = CANVAS_HEIGHT - 80;
    
    // Backspace button
    if (x >= buttonsStartX && x < buttonsStartX + buttonWidth &&
        y >= buttonsStartY && y < buttonsStartY + buttonHeight) {
        playerName = playerName.slice(0, -1);
        keyPressed = true;
    }
    
    // Enter button
    if (x >= buttonsStartX + buttonWidth + buttonSpacing && 
        x < buttonsStartX + buttonWidth * 2 + buttonSpacing &&
        y >= buttonsStartY && y < buttonsStartY + buttonHeight) {
        if (playerName.length > 0) {
            isEnteringName = false;
            gameStarted = true;
            updateCursorVisibility();
            keyPressed = true;
        }
    }
    
    if (keyPressed) {
        triggerHapticFeedback(25);
    }
}

// Add virtual keyboard drawing function
function drawVirtualKeyboard() {
    const startY = CANVAS_HEIGHT/2 + 120;
    const keySize = VIRTUAL_KEYBOARD.keySize;
    const padding = VIRTUAL_KEYBOARD.padding;
    
    VIRTUAL_KEYBOARD.keys.forEach((row, rowIndex) => {
        const rowWidth = row.length * (keySize + padding) - padding;
        const startX = (CANVAS_WIDTH - rowWidth) / 2;
        
        row.forEach((key, keyIndex) => {
            const x = startX + keyIndex * (keySize + padding);
            const y = startY + rowIndex * (keySize + padding);
            
            // Draw key background
            ctx.fillStyle = VIRTUAL_KEYBOARD.color;
            ctx.fillRect(x, y, keySize, keySize);
            
            // Draw key border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, keySize, keySize);
            
            // Draw key text
            ctx.fillStyle = VIRTUAL_KEYBOARD.textColor;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(key, x + keySize/2, y + keySize/2);
        });
    });
}

// Add ray-box intersection helper function
function rayBoxIntersection(origin, direction, box) {
    const xmin = box.x;
    const xmax = box.x + box.width;
    const ymin = box.y;
    const ymax = box.y + box.height;
    
    // Check each edge of the box
    let tmin = (xmin - origin.x) / direction.x;
    let tmax = (xmax - origin.x) / direction.x;
    
    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];
    
    let tymin = (ymin - origin.y) / direction.y;
    let tymax = (ymax - origin.y) / direction.y;
    
    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];
    
    if (tmin > tymax || tymin > tmax) return null;
    
    const t = tmin > tymax ? tmin : tymin;
    
    if (t < 0) return null;
    
    return {
        x: origin.x + direction.x * t,
        y: origin.y + direction.y * t
    };
}

// Add haptic feedback function
function triggerHapticFeedback(duration = 50) {
    if (MOBILE_SETTINGS.hapticFeedback && window.navigator.vibrate) {
        window.navigator.vibrate(duration);
    }
} 