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
const ENEMY_HEALTH = 60;  // Increased from 45 to 60 to require two missiles (50 damage each)
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

// Add powerup constants at the top with other constants
const POWERUP_SIZE = 20;
const POWERUP_SPEED = 1;
const HEALTH_POWERUP_AMOUNT = 30;
const MISSILE_POWERUP_AMOUNT = 4;
const POWERUP_SPAWN_CHANCE = 0.3; // 30% chance on enemy death
const POWERUP_TYPES = {
    HEALTH: 'health',
    MISSILES: 'missiles'
};

// Add array size limits to prevent memory issues
const MAX_PROJECTILES = 100;
const MAX_ENEMY_PROJECTILES = 100;
const MAX_EXPLOSIONS = 20;
const MAX_HIT_FLASHES = 20;

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
let score = 0;
let highScores = [];  // Initialize empty array
let isEnteringName = true;
let playerName = '';
let gameStarted = false;
let powerups = [];

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

// High Score Service - Abstraction for score management
const HighScoreService = {
    // Current storage type ('local' or 'server')
    storageType: 'local',

    // Initialize the service
    async init() {
        if (this.storageType === 'server') {
            try {
                // In the future, this will check server connection
                // await this.testServerConnection();
                console.log('Server high score system initialized');
            } catch (e) {
                console.error('Failed to connect to server, falling back to local storage');
                this.storageType = 'local';
            }
        }
    },

    // Load high scores
    async loadHighScores() {
        if (this.storageType === 'server') {
            try {
                // In the future, this will be a server API call
                // const response = await fetch('/api/highscores');
                // return await response.json();
                return [];
            } catch (e) {
                console.error('Error loading scores from server:', e);
                return [];
            }
        } else {
            // Local storage implementation
            try {
                const savedScores = localStorage.getItem('highScores');
                if (!savedScores) return [];
                
                const parsed = JSON.parse(savedScores);
                if (!Array.isArray(parsed)) return [];
                
                return parsed
                    .filter(entry => (
                        entry && 
                        typeof entry.name === 'string' &&
                        typeof entry.score === 'number' &&
                        entry.score >= 0
                    ))
                    .map(entry => ({
                        name: entry.name.trim().slice(0, NAME_MAX_LENGTH),
                        score: Math.floor(entry.score),
                        timestamp: entry.timestamp || Date.now()
                    }));
            } catch (e) {
                console.error('Error loading local scores:', e);
                return [];
            }
        }
    },

    // Save high scores
    async saveHighScore(name, score) {
        if (!name || typeof score !== 'number') return false;

        const newScore = {
            name: name.trim(),
            score: Math.floor(score),
            timestamp: Date.now()
        };

        try {
            if (this.storageType === 'server') {
                // In the future, this will be a server API call
                // await fetch('/api/highscores', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(newScore)
                // });
                return true;
            } else {
                // Get current scores
                let scores = await this.loadHighScores();
                
                // Add new score
                scores.push(newScore);
                
                // Sort by score (desc) and timestamp (asc)
                scores.sort((a, b) => {
                    if (b.score !== a.score) {
                        return b.score - a.score;
                    }
                    return a.timestamp - b.timestamp;
                });
                
                // Keep only top scores and ensure no duplicates
                scores = scores
                    .filter((score, index, self) => 
                        index === self.findIndex(s => 
                            s.name === score.name && 
                            s.score === score.score
                        )
                    )
                    .slice(0, MAX_HIGH_SCORES);
                
                // Save to localStorage
                localStorage.setItem('highScores', JSON.stringify(scores));
                return true;
            }
        } catch (e) {
            console.error('Error saving high score:', e);
            return false;
        }
    },

    // Clear high scores (for testing/admin purposes)
    async clearHighScores() {
        if (this.storageType === 'server') {
            // In the future, this will be a server API call with admin authentication
            // await fetch('/api/highscores', { method: 'DELETE' });
        } else {
            localStorage.removeItem('highScores');
        }
    }
};

// Modify the game's high score handling functions
async function loadHighScores() {
    highScores = await HighScoreService.loadHighScores();
}

async function addHighScore(name, score) {
    if (await HighScoreService.saveHighScore(name, score)) {
        // Reload scores to get updated list
        await loadHighScores();
    }
}

// Modify init function to add error handling
async function init() {
    try {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Set canvas size
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
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
        // Display error message on canvas if possible
        if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '24px Arial';
            ctx.fillText('Failed to initialize game. Please refresh.', 50, 50);
        }
    }
}

// Add cleanup function for event listeners
const eventListeners = {
    keydown: null,
    keyup: null,
    mousemove: null,
    mousedown: null,
    mouseup: null,
    contextmenu: null,
    mouseleave: null
};

// Modify setupControls to store event listener references
function setupControls() {
    // Remove existing event listeners if they exist
    if (eventListeners.keydown) {
        window.removeEventListener('keydown', eventListeners.keydown);
        window.removeEventListener('keyup', eventListeners.keyup);
        canvas.removeEventListener('mousemove', eventListeners.mousemove);
        canvas.removeEventListener('mousedown', eventListeners.mousedown);
        canvas.removeEventListener('mouseup', eventListeners.mouseup);
        canvas.removeEventListener('contextmenu', eventListeners.contextmenu);
        canvas.removeEventListener('mouseleave', eventListeners.mouseleave);
    }

    // Keyboard controls
    eventListeners.keydown = (e) => {
        if (isEnteringName) {
            handleNameEntry(e.key);
            e.preventDefault();  // Prevent scrolling with spacebar
        } else if (gameOver && e.key.toLowerCase() === 'r') {
            resetGame();
        } else if (e.key.toLowerCase() === 'r' && e.shiftKey) {
            clearHighScores();
        } else {
            updateMovement(e.key, true);
        }
    };
    
    eventListeners.keyup = (e) => {
        updateMovement(e.key, false);
    };
    
    // Mouse controls
    eventListeners.mousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };
    
    eventListeners.mousedown = (e) => {
        if (e.button === 0) { // Left click
            isMouseDown = true;
            fireCannon(); // Fire immediately when pressed
        } else if (e.button === 2 && lockOnTarget && player.missiles > 0) { // Right click
            fireMissile(lockOnTarget);
            player.missiles--;
        }
    };
    
    eventListeners.mouseup = (e) => {
        if (e.button === 0) {
            isMouseDown = false;
        }
    };
    
    eventListeners.contextmenu = (e) => {
        e.preventDefault();
    };
    
    eventListeners.mouseleave = () => {
        isMouseDown = false;
    };

    // Add event listeners
    window.addEventListener('keydown', eventListeners.keydown);
    window.addEventListener('keyup', eventListeners.keyup);
    canvas.addEventListener('mousemove', eventListeners.mousemove);
    canvas.addEventListener('mousedown', eventListeners.mousedown);
    canvas.addEventListener('mouseup', eventListeners.mouseup);
    canvas.addEventListener('contextmenu', eventListeners.contextmenu);
    canvas.addEventListener('mouseleave', eventListeners.mouseleave);
}

// Update player movement state
function updateMovement(key, isPressed) {
    switch(key.toLowerCase()) {
        case 'w':
            player.moving.up = isPressed;
            break;
        case 's':
            player.moving.down = isPressed;
            break;
        case 'a':
            player.moving.left = isPressed;
            break;
        case 'd':
            player.moving.right = isPressed;
            break;
        case ' ':
            if (isPressed && lockOnTarget && player.missiles > 0) {
                fireMissile(lockOnTarget);
                player.missiles--;
            }
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
    
    // Calculate direction vector
    const dx = mouse.x - shipCenter.x;
    const dy = mouse.y - shipCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // Create new projectile
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
        // Create large player explosion
        createExplosion(player.x + player.width/2, player.y + player.height/2);
        // Create additional explosions around the player for bigger effect
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createExplosion(
                    player.x + player.width/2 + (Math.random() * 40 - 20),
                    player.y + player.height/2 + (Math.random() * 40 - 20)
                );
            }, i * 100);
        }
        // Wait for all explosions to complete before showing game over
        setTimeout(() => {
            gameOver = true;
            if (score > 0) {
                addHighScore(playerName, score);
            }
        }, EXPLOSION_DURATION + 300); // Wait for main explosion + delayed explosions
        player.health = 0; // Ensure health shows as 0
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
                    score += SCORE_BASIC_ENEMY;
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    if (Math.random() < POWERUP_SPAWN_CHANCE) {
                        spawnPowerup(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    }
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
                    score += SCORE_BASIC_ENEMY;
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
            if (Math.random() < POWERUP_SPAWN_CHANCE) {
                spawnPowerup(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            }
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

    // Update powerups
    powerups = powerups.filter(powerup => {
        // Move powerup left and down (increased speed from 0.5 to 2.0)
        powerup.x -= 2.0;
        powerup.y += 0.3;
        
        // Add gentle bobbing effect
        powerup.y += Math.sin(Date.now() / 300) * 0.3;
        
        // Check collision with player
        if (checkCircleRectCollision(
            { x: powerup.x, y: powerup.y, radius: powerup.size/2 },
            player
        )) {
            // Apply powerup effect
            if (powerup.type === POWERUP_TYPES.HEALTH) {
                player.health = Math.min(100, player.health + HEALTH_POWERUP_AMOUNT);
            } else {
                player.missiles = Math.min(MISSILE_MAX_COUNT, player.missiles + MISSILE_POWERUP_AMOUNT);
            }
            return false;
        }
        
        // Remove if off screen (check left boundary)
        return powerup.x > 0 && powerup.y < CANVAS_HEIGHT;
    });

    // Limit array sizes
    if (projectiles.length > MAX_PROJECTILES) {
        projectiles = projectiles.slice(-MAX_PROJECTILES);
    }
    if (enemyProjectiles.length > MAX_ENEMY_PROJECTILES) {
        enemyProjectiles = enemyProjectiles.slice(-MAX_ENEMY_PROJECTILES);
    }
    if (explosions.length > MAX_EXPLOSIONS) {
        explosions = explosions.slice(-MAX_EXPLOSIONS);
    }
    if (hitFlashes.length > MAX_HIT_FLASHES) {
        hitFlashes = hitFlashes.slice(-MAX_HIT_FLASHES);
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

// Draw aim line
function drawAimLine() {
    const shipCenter = {
        x: player.x + player.width,
        y: player.y + player.height / 2
    };
    
    // Debug aim line (commented out)
    /*
    ctx.beginPath();
    ctx.moveTo(shipCenter.x, shipCenter.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    */
    
    // Draw crosshair
    const crosshairSize = 10;
    const lineWidth = 2;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    // Draw lock-on box if target is being locked
    if (lockOnTarget) {
        const lockTime = Date.now();
        const lockProgress = Math.min(1, (lockTime - lockStartTime) / MISSILE_LOCK_TIME);
        
        ctx.strokeStyle = `rgba(255, 0, 0, ${lockProgress})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            lockOnTarget.x - 2,
            lockOnTarget.y - 2,
            lockOnTarget.width + 4,
            lockOnTarget.height + 4
        );
    }
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
        
        // Draw triangle instead of rectangle
        ctx.beginPath();
        // Point facing left (nose)
        ctx.moveTo(plane.x, plane.y + plane.height/2);
        // Right side points (back of aircraft)
        ctx.lineTo(plane.x + plane.width, plane.y);  // Top point
        ctx.lineTo(plane.x + plane.width, plane.y + plane.height);  // Bottom point
        ctx.closePath();
        ctx.fill();
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
    
    // Draw aim line
    if (!gameOver) {
        drawAimLine();
    }
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw missiles
    drawMissiles();
    
    // Draw player with hit flash effect (only if health > 0)
    if (player.health > 0) {
        const isPlayerFlashing = hitFlashes.some(flash => flash.target === player);
        ctx.fillStyle = isPlayerFlashing ? '#FFFFFF' : '#00FF00';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
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
    
    // Draw powerups
    powerups.forEach(powerup => {
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, powerup.size/2, 0, Math.PI * 2);
        ctx.fillStyle = powerup.type === POWERUP_TYPES.HEALTH ? '#00FF00' : '#00FFFF';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw plus symbol inside
        ctx.beginPath();
        ctx.moveTo(powerup.x - powerup.size/4, powerup.y);
        ctx.lineTo(powerup.x + powerup.size/4, powerup.y);
        if (powerup.type === POWERUP_TYPES.HEALTH) {
            ctx.moveTo(powerup.x, powerup.y - powerup.size/4);
            ctx.lineTo(powerup.x, powerup.y + powerup.size/4);
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw UI elements
    drawUI();
    
    // Draw game over screen if needed
    if (gameOver) {
        drawGameOver();
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
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Battleships', canvas.width/2, canvas.height/4);
    
    // Name entry
    ctx.font = '24px Arial';
    ctx.fillText('Enter your name:', canvas.width/2, canvas.height/2 - 40);
    
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
    
    // How to play instructions
    ctx.font = '16px Arial';
    const instructions = [
        'How to Play:',
        '- WASD keys to move your ship',
        '- Left click to fire cannons',
        '- Right click to launch missiles at aircraft (or ships)',
        '- Mouse to aim',
        '- Collect powerups for health (green) and missiles (blue)',
        '',
        'Press ENTER to start'
    ];
    
    // Start drawing instructions lower on the screen, after the name entry box
    const instructionsStartY = CANVAS_HEIGHT/2 + 120;
    instructions.forEach((line, index) => {
        ctx.fillText(line, canvas.width/2, instructionsStartY + (index * 25));
    });
    
    // Version and copyright
    ctx.font = '12px Arial';
    ctx.fillText('© 2025 Klemens Ehret', canvas.width/2, canvas.height - 20);
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
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
    const scoreAreaWidth = 400;  // Width of the area for scores
    const startX = CANVAS_WIDTH/2 - scoreAreaWidth/2;
    const scoreX = CANVAS_WIDTH/2 + scoreAreaWidth/2;
    
    if (highScores.length === 0) {
        ctx.textAlign = 'center';
        ctx.fillText('No High Scores Yet', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 30);
    } else {
        highScores.forEach((entry, index) => {
            const y = CANVAS_HEIGHT/2 + 30 + (index * 30);
            // Draw rank and name (left-aligned)
            ctx.textAlign = 'left';
            ctx.fillText(`${index + 1}. ${entry.name}`, startX, y);
            
            // Draw score (right-aligned)
            ctx.textAlign = 'right';
            ctx.fillText(entry.score.toString().padStart(6, '0'), scoreX, y);
        });
    }
    
    ctx.textAlign = 'center';  // Reset alignment for the restart text
    ctx.font = '20px Arial';
    ctx.fillText('Press R to Restart', CANVAS_WIDTH/2, CANVAS_HEIGHT - 40);
}

// Update cursor visibility based on game state
function updateCursorVisibility() {
    canvas.style.cursor = isEnteringName ? 'default' : 'none';
}

// Handle name entry for high score
function handleNameEntry(key) {
    if (!isEnteringName) return;
    
    if (key === 'Enter' || key === 'NumpadEnter') {  // Support both Enter keys
        if (playerName.length > 0) {
            isEnteringName = false;  // Exit name entry mode
            gameStarted = true;      // Start the game
            updateCursorVisibility(); // Hide cursor when game starts
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

// Add powerup spawn function
function spawnPowerup(x, y) {
    powerups.push({
        x,
        y,
        type: Math.random() < 0.5 ? POWERUP_TYPES.HEALTH : POWERUP_TYPES.MISSILES,
        size: POWERUP_SIZE
    });
}

// Add clear high scores function
function clearHighScores() {
    highScores = [];
    localStorage.removeItem('highScores');
    console.log('High scores cleared');
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

// Modify resetGame to properly clean up
async function resetGame() {
    try {
        // Reset player state
        player.health = 100;
        player.missiles = MISSILE_MAX_COUNT;
        player.x = 50;
        player.y = CANVAS_HEIGHT * 2/3;
        
        // Clear all arrays
        projectiles = [];
        enemyProjectiles = [];
        enemies = [];
        aircraft = [];
        missiles = [];
        explosions = [];
        hitFlashes = [];
        powerups = [];
        score = 0;
        
        // Reset game state
        gameOver = false;
        isEnteringName = true;
        playerName = '';
        gameStarted = false;
        
        // Reload high scores
        await loadHighScores();
        
        updateCursorVisibility();
    } catch (error) {
        console.error('Failed to reset game:', error);
        // Display error message on canvas
        if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '24px Arial';
            ctx.fillText('Failed to reset game. Please refresh.', 50, 50);
        }
    }
} 