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

// Ship-to-Ship Missile (SSM) constants
const SSM_SPEED = 8; // Slightly slower than regular missiles
const SSM_SIZE = 10; // Larger than regular missiles
const SSM_COLOR = '#FFA500'; // Orange color
const SSM_DAMAGE = 80; // More damage than regular missiles
const SSM_MAX_COUNT = 8; // Player has 8 SSMs
const SSM_RADAR_ACTIVATION_TIME = 1000; // 1 second before radar activates
const SSM_RADAR_ANGLE = Math.PI / 3; // 60 degrees radar cone
const SSM_RADAR_RANGE = 400; // Radar detection range
const SSM_TURN_SPEED = 4.0; // Less agile than regular missiles
const SSM_MIN_DISTANCE = 5; // Minimum distance to consider a hit

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
    buttonOpacity: 0.5,
    activeButtonOpacity: 0.7,
    minimumTouchSize: 48, // Minimum 48x48px touch target
    doubleTapTimeout: 300 // ms between taps
};

// Add joystick control constants
const JOYSTICK_CONTROLS = {
    enabled: false,
    size: 120, // Increased size for better touch usability
    movementThreshold: 0.1, // Lower threshold for better response
    movementMaxForce: 0.75,  // Force value at which max speed is reached
    movementMultiplier: 1.75, // Increased multiplier for better control
    movementZone: {          // Movement joystick location information
        x: 0,
        y: 0,
        diameter: 120, // Increased diameter
        dynamicPosition: false
    },
    actionZone: {            // Action joystick location information  
        x: 0,
        y: 0,
        diameter: 120, // Increased diameter
        dynamicPosition: false
    },
    missileButton: {         // Missile button above movement joystick
        x: 0,
        y: 0,
        size: 80, // Larger missile button
        color: 'rgba(0, 255, 255, 0.7)', // More visible
        activeColor: 'rgba(0, 255, 255, 0.9)' // More visible when active
    },
    ssmButton: {            // SSM button above missile button
        x: 0,
        y: 0,
        size: 80, // Same size as missile button
        color: 'rgba(255, 165, 0, 0.7)', // Orange
        activeColor: 'rgba(255, 165, 0, 0.9)' // Brighter orange when active
    },
    styles: {
        position: 'absolute',
        zIndex: 100,
        opacity: 0.85 // Increased opacity for better visibility
    }
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
    keySize: 60, // Larger key size for better touch targets
    padding: 8,  // Increased padding between keys
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
let missiles = []; // Regular missiles
let ssms = []; // Array to store Ship-to-Ship Missiles
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

// Add joystick variables
let joysticks = {
    movement: null,
    action: null
};

let joystickState = {
    movementDirection: { x: 0, y: 0 },
    movementForce: 0,
    aimDirection: { x: 0, y: 0 },
    aimForce: 0,
    firing: false
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
    ssms: SSM_MAX_COUNT, // Add SSM count to player
    isHit: false,
    hitTime: 0
};

// Add after game variables
let targetingAngle = 0; // Angle in radians, 0 points right
const TARGETING_SPEED = 0.05; // Speed of targeting vector rotation
const TARGETING_LENGTH = CANVAS_WIDTH; // Maximum length of targeting vector

// Add error display function after the constants
function showError(error) {
    console.error('Game Error:', error);
    
    // Create or get error display element
    let errorDisplay = document.getElementById('errorDisplay');
    if (!errorDisplay) {
        errorDisplay = document.createElement('div');
        errorDisplay.id = 'errorDisplay';
        errorDisplay.style.position = 'fixed';
        errorDisplay.style.top = '10px';
        errorDisplay.style.left = '10px';
        errorDisplay.style.right = '10px';
        errorDisplay.style.padding = '10px';
        errorDisplay.style.background = 'rgba(255, 0, 0, 0.8)';
        errorDisplay.style.color = 'white';
        errorDisplay.style.fontFamily = 'Arial, sans-serif';
        errorDisplay.style.fontSize = '14px';
        errorDisplay.style.zIndex = '2000';
        errorDisplay.style.whiteSpace = 'pre-wrap';
        document.body.appendChild(errorDisplay);
    }
    
    // Add timestamp and error details
    const timestamp = new Date().toISOString();
    errorDisplay.textContent = `${timestamp}\n${error.toString()}\n\n${errorDisplay.textContent || ''}`;
}

// Initialize the game
async function init() {
    try {
        // Log initialization start
        console.log('Initializing game...');
        console.log('Window dimensions:', window.innerWidth, 'x', window.innerHeight);
        console.log('Device pixel ratio:', window.devicePixelRatio);
        
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        console.log('Canvas found');
        
        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        console.log('Canvas context obtained');
        
        // Check if device supports touch
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // For mobile optimization, use joysticks
        JOYSTICK_CONTROLS.enabled = isTouchDevice;
        VIRTUAL_KEYBOARD.enabled = isTouchDevice;
        
        console.log('Touch enabled:', isTouchDevice);
        console.log('Joysticks enabled:', JOYSTICK_CONTROLS.enabled);
        console.log('Max touch points:', navigator.maxTouchPoints);
        
        // Make canvas responsive
        resizeCanvas();
        window.addEventListener('resize', () => {
            resizeCanvas();
            if (JOYSTICK_CONTROLS.enabled) {
                setupJoysticks();
            }
        });
        console.log('Canvas resized');
        
        // Initialize high score service and load scores
        await HighScoreService.init();
        await loadHighScores();
        console.log('High scores loaded');
        
        // Setup controls
        setupControls();
        // Don't setup joysticks here - they'll be setup after name entry is complete
        console.log('Controls set up');
        
        // Hide cursor during gameplay, show during name entry
        updateCursorVisibility();
        console.log('Cursor visibility updated');
        
        // Start the game loop
        console.log('Starting game loop');
        gameLoop();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError(error);
        
        if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '24px Arial';
            ctx.fillText('Failed to initialize game. Please refresh.', 50, 50);
            ctx.font = '16px Arial';
            ctx.fillText(error.toString(), 50, 80);
        }
    }
}

// Update resizeCanvas function
function resizeCanvas() {
    try {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
        
        console.log('Resizing canvas...', {
            containerWidth,
            containerHeight,
            aspectRatio,
            devicePixelRatio: window.devicePixelRatio
        });
        
        let newWidth, newHeight;
        
        // Calculate new dimensions to fit the screen while maintaining aspect ratio
        if (containerHeight * aspectRatio <= containerWidth) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        } else {
            newWidth = containerWidth;
            newHeight = containerWidth / aspectRatio;
        }
        
        console.log('New canvas dimensions:', {
            width: newWidth,
            height: newHeight
        });
        
        // Set canvas size
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    } catch (error) {
        console.error('Error in resizeCanvas:', error);
        showError(error);
    }
}

// Setup joystick controls using nipplejs
function setupJoysticks() {
    // Don't setup joysticks during name entry or game over
    if (isEnteringName || gameOver) {
        return;
    }
    
    console.log("Setting up joysticks");
    
    // Remove existing joysticks if any
    if (joysticks.movement) {
        joysticks.movement.destroy();
        console.log("Destroyed existing movement joystick");
    }
    if (joysticks.action) {
        joysticks.action.destroy();
        console.log("Destroyed existing action joystick");
    }
    
    // Remove any existing joystick containers
    const existingContainers = document.querySelectorAll('.joystick-container');
    existingContainers.forEach(container => {
        document.body.removeChild(container);
    });
    
    // Remove any existing missile button
    const existingMissileBtn = document.getElementById('missileButton');
    if (existingMissileBtn) {
        document.body.removeChild(existingMissileBtn);
        console.log("Removed existing missile button");
    }
    
    // Remove any existing SSM button
    const existingSsmBtn = document.getElementById('ssmButton');
    if (existingSsmBtn) {
        document.body.removeChild(existingSsmBtn);
        console.log("Removed existing SSM button");
    }

    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    console.log("Window dimensions:", windowWidth, "x", windowHeight);
    
    // Joystick dimensions
    const joystickSize = JOYSTICK_CONTROLS.size;
    const containerSize = joystickSize + 20; // Add some padding
    
    // Create container for left joystick (movement)
    const leftContainer = document.createElement('div');
    leftContainer.className = 'joystick-container';
    leftContainer.id = 'movement-joystick-container';
    leftContainer.style.position = 'fixed';
    leftContainer.style.bottom = '20px';
    leftContainer.style.left = '20px';
    leftContainer.style.width = containerSize + 'px';
    leftContainer.style.height = containerSize + 'px';
    leftContainer.style.zIndex = '1000';
    document.body.appendChild(leftContainer);
    
    // Create container for right joystick (action)
    const rightContainer = document.createElement('div');
    rightContainer.className = 'joystick-container';
    rightContainer.id = 'action-joystick-container';
    rightContainer.style.position = 'fixed';
    rightContainer.style.bottom = '20px';
    rightContainer.style.right = '20px';
    rightContainer.style.width = containerSize + 'px';
    rightContainer.style.height = containerSize + 'px';
    rightContainer.style.zIndex = '1000';
    document.body.appendChild(rightContainer);
    
    console.log("Created joystick containers");
    
    // Create SSM button
    const ssmBtn = document.createElement('div');
    ssmBtn.id = 'ssmButton';
    ssmBtn.style.position = 'fixed';
    ssmBtn.style.bottom = (containerSize + 40 + JOYSTICK_CONTROLS.missileButton.size + 20) + 'px'; // Position above missile button
    ssmBtn.style.left = '20px';
    ssmBtn.style.width = JOYSTICK_CONTROLS.ssmButton.size + 'px';
    ssmBtn.style.height = JOYSTICK_CONTROLS.ssmButton.size + 'px';
    ssmBtn.style.borderRadius = '50%';
    ssmBtn.style.backgroundColor = JOYSTICK_CONTROLS.ssmButton.color;
    ssmBtn.style.border = '2px solid white';
    ssmBtn.style.display = 'flex';
    ssmBtn.style.justifyContent = 'center';
    ssmBtn.style.alignItems = 'center';
    ssmBtn.style.fontSize = (JOYSTICK_CONTROLS.ssmButton.size * 0.5) + 'px';
    ssmBtn.style.color = 'white';
    ssmBtn.style.zIndex = '1000';
    ssmBtn.style.userSelect = 'none';
    ssmBtn.style.touchAction = 'none';
    ssmBtn.innerHTML = '🚀➡️'; // Rocket followed by right arrow
    document.body.appendChild(ssmBtn);
    
    // Create missile button
    const missileBtn = document.createElement('div');
    missileBtn.id = 'missileButton';
    missileBtn.style.position = 'fixed';
    missileBtn.style.bottom = (containerSize + 40) + 'px'; // Position above left joystick
    missileBtn.style.left = '20px';
    missileBtn.style.width = JOYSTICK_CONTROLS.missileButton.size + 'px';
    missileBtn.style.height = JOYSTICK_CONTROLS.missileButton.size + 'px';
    missileBtn.style.borderRadius = '50%';
    missileBtn.style.backgroundColor = JOYSTICK_CONTROLS.missileButton.color;
    missileBtn.style.border = '2px solid white';
    missileBtn.style.display = 'flex';
    missileBtn.style.justifyContent = 'center';
    missileBtn.style.alignItems = 'center';
    missileBtn.style.fontSize = (JOYSTICK_CONTROLS.missileButton.size * 0.5) + 'px';
    missileBtn.style.color = 'white';
    missileBtn.style.zIndex = '1000';
    missileBtn.style.userSelect = 'none';
    missileBtn.style.touchAction = 'none';
    missileBtn.innerHTML = '🚀';
    document.body.appendChild(missileBtn);
    
    // Create movement joystick in its container
    console.log("Creating movement joystick within container");
    joysticks.movement = nipplejs.create({
        zone: document.getElementById('movement-joystick-container'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        size: joystickSize,
        color: 'white',
        lockX: false,
        lockY: false
    });
    
    // Create action joystick in its container
    console.log("Creating action joystick within container");
    joysticks.action = nipplejs.create({
        zone: document.getElementById('action-joystick-container'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        size: joystickSize,
        color: 'red',
        lockX: false,
        lockY: false
    });
    
    // Add event listeners for the SSM button
    ssmBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        ssmBtn.style.backgroundColor = JOYSTICK_CONTROLS.ssmButton.activeColor;
        // Fire SSM if player has SSMs
        if (player.ssms > 0) {
            fireSSM();
            player.ssms--;
            // Add haptic feedback if available
            if (navigator.vibrate && MOBILE_SETTINGS.hapticFeedback) {
                navigator.vibrate(100);
            }
        }
    });
    
    ssmBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        ssmBtn.style.backgroundColor = JOYSTICK_CONTROLS.ssmButton.color;
    });
    
    // Add event listeners for the missile button
    missileBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        missileBtn.style.backgroundColor = JOYSTICK_CONTROLS.missileButton.activeColor;
        // Fire missile if there's a locked target and player has missiles
        if (lockOnTarget && player.missiles > 0) {
            fireMissile(lockOnTarget);
            player.missiles--;
            // Add haptic feedback if available
            if (navigator.vibrate && MOBILE_SETTINGS.hapticFeedback) {
                navigator.vibrate(100);
            }
        }
    });
    
    missileBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        missileBtn.style.backgroundColor = JOYSTICK_CONTROLS.missileButton.color;
    });
    
    // Set up event listeners for movement joystick
    joysticks.movement.on('move', (evt, data) => {
        const force = Math.min(data.force, 1.0);
        joystickState.movementForce = force;
        joystickState.movementDirection.x = data.vector.x;
        joystickState.movementDirection.y = data.vector.y;
        
        // Update player movement based on joystick input
        if (force >= JOYSTICK_CONTROLS.movementThreshold) {
            player.moving.right = data.vector.x > 0;
            player.moving.left = data.vector.x < 0;
            // Swap up and down to fix inverted controls
            player.moving.up = data.vector.y > 0; // Changed from < 0 to > 0
            player.moving.down = data.vector.y < 0; // Changed from > 0 to < 0
        }
    });
    
    joysticks.movement.on('end', () => {
        // Reset movement state when joystick is released
        joystickState.movementForce = 0;
        joystickState.movementDirection.x = 0;
        joystickState.movementDirection.y = 0;
        player.moving.up = false;
        player.moving.down = false;
        player.moving.left = false;
        player.moving.right = false;
    });
    
    // Set up event listeners for action/aiming joystick
    joysticks.action.on('start', () => {
        // Start firing immediately when joystick is touched
        joystickState.firing = true;
        isMouseDown = true;
    });
    
    joysticks.action.on('move', (evt, data) => {
        const force = Math.min(data.force, 1.0);
        joystickState.aimForce = force;
        joystickState.aimDirection.x = data.vector.x;
        joystickState.aimDirection.y = data.vector.y;
        
        // Update mouse position for aiming
        if (force >= JOYSTICK_CONTROLS.movementThreshold) {
            // Calculate aim position based on player position and joystick direction
            // Invert the y-axis for aiming to fix inverted controls
            mouse.x = player.x + player.width + (CANVAS_WIDTH - player.x - player.width) * 0.5 * (data.vector.x + 1);
            mouse.y = player.y + (-data.vector.y * CANVAS_HEIGHT * 0.5); // Added negative sign to invert Y
            
            // Make sure we are firing while aiming
            if (!joystickState.firing) {
                joystickState.firing = true;
                isMouseDown = true;
            }
        }
    });
    
    joysticks.action.on('end', () => {
        // Reset aiming and firing state when joystick is released
        joystickState.aimForce = 0;
        joystickState.aimDirection.x = 0;
        joystickState.aimDirection.y = 0;
        joystickState.firing = false;
        isMouseDown = false;
    });
    
    console.log("Joystick setup complete");
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
        } else if (e.key === 'q' && player.ssms > 0) {
            // 'Q' key to fire SSM
            fireSSM();
            player.ssms--;
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
        if (gameOver && gameOver.restartButton) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = CANVAS_WIDTH / rect.width;
            const scaleY = CANVAS_HEIGHT / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            const button = gameOver.restartButton;
            if (mouseX >= button.x && mouseX <= button.x + button.width &&
                mouseY >= button.y && mouseY <= button.y + button.height) {
                resetGame();
                return;
            }
        }
        
        if (e.button === 0) { // Left click
            isMouseDown = true;
            fireCannon(); // Fire immediately when pressed
        } else if (e.button === 2 && lockOnTarget && player.missiles > 0) { // Right click
            fireMissile(lockOnTarget);
            player.missiles--;
        } else if (e.button === 1 && player.ssms > 0) { // Middle click for SSM
            fireSSM();
            player.ssms--;
            e.preventDefault(); // Prevent default middle-click behavior
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
    
    // Touch controls for name entry and virtual keyboard
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
    
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
        vx: normalizedDx * CANNON_SPEED,
        vy: normalizedDy * CANNON_SPEED,
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
    if (!enemy.lastShotTime) {
        enemy.lastShotTime = currentTime;
        return;
    }
    
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
        vx: normalizedDx * ENEMY_PROJECTILE_SPEED,
        vy: normalizedDy * ENEMY_PROJECTILE_SPEED,
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
        verticalDirection: Math.random() < 0.5 ? 1 : -1 // Random initial vertical direction (1 = down, -1 = up)
    });
}

// Aircraft fires at player
function aircraftShoot(aircraft) {
    const currentTime = Date.now();
    if (!aircraft.lastShotTime) {
        aircraft.lastShotTime = currentTime;
        return;
    }
    
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
        vx: normalizedDx * ENEMY_PROJECTILE_SPEED,
        vy: normalizedDy * ENEMY_PROJECTILE_SPEED,
        size: CANNON_SIZE
    });
    
    aircraft.lastShotTime = currentTime;
}

// Update game state
function update() {
    try {
        // Don't update game if entering name
        if (isEnteringName) return;
        
        // Don't update if game over
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
        
        // Handle continuous cannon fire if mouse is held down
        if (isMouseDown) {
            const currentTime = Date.now();
            if (currentTime - lastShotTime >= CANNON_COOLDOWN) {
                fireCannon();
                lastShotTime = currentTime;
            }
        }
        
        // Calculate player movement speed
        let moveSpeed = player.speed;
        
        // If joystick controls are enabled and active, adjust speed based on force
        if (JOYSTICK_CONTROLS.enabled && joystickState.movementForce > 0) {
            const speedFactor = Math.min(
                1 + (JOYSTICK_CONTROLS.movementMultiplier - 1) * 
                (joystickState.movementForce / JOYSTICK_CONTROLS.movementMaxForce),
                JOYSTICK_CONTROLS.movementMultiplier
            );
            moveSpeed *= speedFactor;
        }
        
        // Update player position based on movement flags
        if (player.moving.up) {
            // Limit upward movement based on SHIP_FLOAT_HEIGHT
            const maxUpwardY = WATER_START - SHIP_FLOAT_HEIGHT;
            player.y = Math.max(player.y - moveSpeed, maxUpwardY);
        }
        if (player.moving.down) {
            // Limit downward movement to canvas bottom
            player.y = Math.min(player.y + moveSpeed, CANVAS_HEIGHT - player.height);
        }
        if (player.moving.left) {
            // Limit leftward movement to the left edge
            player.x = Math.max(player.x - moveSpeed, 0);
        }
        if (player.moving.right) {
            // Limit rightward movement to the right edge
            player.x = Math.min(player.x + moveSpeed, CANVAS_WIDTH - player.width);
        }
        
        // Update projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            projectiles[i].x += projectiles[i].vx;
            projectiles[i].y += projectiles[i].vy;
            
            // Remove projectiles that go off screen
            if (projectiles[i].x > CANVAS_WIDTH || 
                projectiles[i].x < 0 || 
                projectiles[i].y > CANVAS_HEIGHT || 
                projectiles[i].y < 0) {
                projectiles.splice(i, 1);
                continue;
            }
            
            // Check for collisions with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(
                    {x: projectiles[i].x - CANNON_SIZE/2, y: projectiles[i].y - CANNON_SIZE/2, width: CANNON_SIZE, height: CANNON_SIZE},
                    {x: enemies[j].x, y: enemies[j].y, width: enemies[j].width, height: enemies[j].height}
                )) {
                    enemies[j].health -= 10;
                    createHitFlash(enemies[j]);
                    
                    // Check if enemy destroyed
                    if (enemies[j].health <= 0) {
                        // Add explosion
                        createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2);
                        
                        // Remove enemy
                        enemies.splice(j, 1);
                        
                        // Increment score
                        score++;
                    }
                    
                    // Remove projectile
                    projectiles.splice(i, 1);
                    break;
                }
            }
            
            // Check if the projectile hits an aircraft
            if (i >= 0 && i < projectiles.length) { // Make sure the projectile still exists after checking enemies
                for (let j = aircraft.length - 1; j >= 0; j--) {
                    if (checkCollision(
                        {x: projectiles[i].x - CANNON_SIZE/2, y: projectiles[i].y - CANNON_SIZE/2, width: CANNON_SIZE, height: CANNON_SIZE},
                        {x: aircraft[j].x, y: aircraft[j].y, width: aircraft[j].width, height: aircraft[j].height}
                    )) {
                        aircraft[j].health -= 10;
                        createHitFlash(aircraft[j]);
                        
                        // Check if aircraft destroyed
                        if (aircraft[j].health <= 0) {
                            // Add explosion
                            createExplosion(aircraft[j].x + aircraft[j].width/2, aircraft[j].y + aircraft[j].height/2);
                            
                            // Remove aircraft
                            aircraft.splice(j, 1);
                            
                            // Increment score
                            score++;
                        }
                        
                        // Remove projectile
                        projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
        
        // Update enemy projectiles
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            enemyProjectiles[i].x += enemyProjectiles[i].vx;
            enemyProjectiles[i].y += enemyProjectiles[i].vy;
            
            // Remove projectiles that go off screen
            if (enemyProjectiles[i].x > CANVAS_WIDTH || 
                enemyProjectiles[i].x < 0 || 
                enemyProjectiles[i].y > CANVAS_HEIGHT || 
                enemyProjectiles[i].y < 0) {
                enemyProjectiles.splice(i, 1);
                continue;
            }
            
            // Check for collisions with player
            if (checkCollision(
                {x: enemyProjectiles[i].x - CANNON_SIZE/2, y: enemyProjectiles[i].y - CANNON_SIZE/2, width: CANNON_SIZE, height: CANNON_SIZE},
                {x: player.x, y: player.y, width: player.width, height: player.height}
            )) {
                player.health -= 5;
                player.isHit = true;
                player.hitTime = Date.now();
                enemyProjectiles.splice(i, 1);
            }
        }
        
        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].x -= ENEMY_SPEED;
            
            // Remove enemies that go off screen
            if (enemies[i].x + enemies[i].width < 0) {
                enemies.splice(i, 1);
                continue;
            }
            
            // Enemy shooting
            const now = Date.now();
            if (now - enemies[i].lastShotTime > ENEMY_SHOT_INTERVAL) {
                enemyShoot(enemies[i]);
                enemies[i].lastShotTime = now;
            }
            
            // Check for collisions with player
            if (checkCollision(
                {x: enemies[i].x, y: enemies[i].y, width: enemies[i].width, height: enemies[i].height},
                {x: player.x, y: player.y, width: player.width, height: player.height}
            )) {
                // Both take damage on collision
                player.health -= COLLISION_DAMAGE;
                enemies[i].health -= COLLISION_DAMAGE;
                
                // Visual feedback
                player.isHit = true;
                player.hitTime = now;
                createHitFlash(enemies[i]);
                
                // Check if enemy destroyed by collision
                if (enemies[i].health <= 0) {
                    createExplosion(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2);
                    enemies.splice(i, 1);
                    score++;
                }
            }
        }
        
        // Update aircraft
        for (let i = aircraft.length - 1; i >= 0; i--) {
            aircraft[i].x -= AIRCRAFT_SPEED;
            
            // Vertical movement (wave pattern)
            aircraft[i].verticalDirection = 
                (aircraft[i].y <= 10) ? 1 : 
                (aircraft[i].y >= WATER_START - aircraft[i].height - 10) ? -1 : 
                aircraft[i].verticalDirection;
            
            aircraft[i].y += aircraft[i].verticalDirection * AIRCRAFT_VERTICAL_SPEED;
            
            // Remove aircraft that go off screen
            if (aircraft[i].x + aircraft[i].width < 0) {
                aircraft.splice(i, 1);
                continue;
            }
            
            // Aircraft shooting
            const now = Date.now();
            if (now - aircraft[i].lastShotTime > AIRCRAFT_SHOT_INTERVAL) {
                aircraftShoot(aircraft[i]);
                aircraft[i].lastShotTime = now;
            }
            
            // Check for collisions with player
            if (checkCollision(
                {x: aircraft[i].x, y: aircraft[i].y, width: aircraft[i].width, height: aircraft[i].height},
                {x: player.x, y: player.y, width: player.width, height: player.height}
            )) {
                // Both take damage on collision
                player.health -= COLLISION_DAMAGE;
                aircraft[i].health -= COLLISION_DAMAGE;
                
                // Visual feedback
                player.isHit = true;
                player.hitTime = now;
                createHitFlash(aircraft[i]);
                
                // Check if aircraft destroyed by collision
                if (aircraft[i].health <= 0) {
                    createExplosion(aircraft[i].x + aircraft[i].width/2, aircraft[i].y + aircraft[i].height/2);
                    aircraft.splice(i, 1);
                    score++;
                }
            }
        }
        
        // Update missiles
        for (let i = missiles.length - 1; i >= 0; i--) {
            const missile = missiles[i];
            
            // Update target status (might have been destroyed)
            if (missile.target) {
                // Check if target still exists
                if (missile.target.type === 'aircraft') {
                    if (!aircraft.includes(missile.target)) {
                        missile.target = null;
                    }
                } else if (missile.target.type === 'enemy') {
                    if (!enemies.includes(missile.target)) {
                        missile.target = null;
                    }
                }
            }
            
            // Guided movement if we have a target
            if (missile.target) {
                // Calculate target center
                const targetCenterX = missile.target.x + missile.target.width / 2;
                const targetCenterY = missile.target.y + missile.target.height / 2;
                
                // Calculate direction to target
                const dx = targetCenterX - missile.x;
                const dy = targetCenterY - missile.y;
                const distToTarget = Math.sqrt(dx * dx + dy * dy);
                
                if (distToTarget < MISSILE_MIN_DISTANCE) {
                    // Direct hit, damage target
                    missile.target.health -= MISSILE_DAMAGE;
                    createHitFlash(missile.target);
                    
                    // Check if target destroyed
                    if (missile.target.health <= 0) {
                        if (missile.target.type === 'aircraft') {
                            const index = aircraft.indexOf(missile.target);
                            if (index !== -1) {
                                createExplosion(
                                    aircraft[index].x + aircraft[index].width/2, 
                                    aircraft[index].y + aircraft[index].height/2
                                );
                                aircraft.splice(index, 1);
                                score++;
                            }
                        } else if (missile.target.type === 'enemy') {
                            const index = enemies.indexOf(missile.target);
                            if (index !== -1) {
                                createExplosion(
                                    enemies[index].x + enemies[index].width/2, 
                                    enemies[index].y + enemies[index].height/2
                                );
                                enemies.splice(index, 1);
                                score++;
                            }
                        }
                    }
                    
                    // Create explosion and remove missile
                    createExplosion(missile.x, missile.y);
                    missiles.splice(i, 1);
                    continue;
                }
                
                // Normalize direction
                const normalizedDx = dx / distToTarget;
                const normalizedDy = dy / distToTarget;
                
                // Apply homing behavior
                const turnRate = MISSILE_TURN_SPEED;
                const currentDirMagnitude = Math.sqrt(missile.vx * missile.vx + missile.vy * missile.vy);
                
                // Gradually adjust velocity toward target
                missile.vx = missile.vx + normalizedDx * turnRate;
                missile.vy = missile.vy + normalizedDy * turnRate;
                
                // Normalize velocity to maintain consistent speed
                const newMagnitude = Math.sqrt(missile.vx * missile.vx + missile.vy * missile.vy);
                missile.vx = (missile.vx / newMagnitude) * MISSILE_SPEED;
                missile.vy = (missile.vy / newMagnitude) * MISSILE_SPEED;
            }
            
            // Update position
            missile.x += missile.vx;
            missile.y += missile.vy;
            
            // Remove missiles that go off screen
            if (missile.x > CANVAS_WIDTH || 
                missile.x < 0 || 
                missile.y > CANVAS_HEIGHT || 
                missile.y < 0) {
                missiles.splice(i, 1);
                continue;
            }
            
            // Check for collisions with enemies (only for unguided missiles)
            if (!missile.target) {
                for (let j = 0; j < enemies.length; j++) {
                    if (checkCollision(
                        {x: missile.x - MISSILE_SIZE/2, y: missile.y - MISSILE_SIZE/2, width: MISSILE_SIZE, height: MISSILE_SIZE},
                        {x: enemies[j].x, y: enemies[j].y, width: enemies[j].width, height: enemies[j].height}
                    )) {
                        enemies[j].health -= MISSILE_DAMAGE;
                        createHitFlash(enemies[j]);
                        
                        // Check if enemy destroyed
                        if (enemies[j].health <= 0) {
                            createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2);
                            enemies.splice(j, 1);
                            score++;
                        }
                        
                        // Create explosion and remove missile
                        createExplosion(missile.x, missile.y);
                        missiles.splice(i, 1);
                        break;
                    }
                }
            }
            
            // Check if the missile still exists after checking enemies
            if (i >= missiles.length) continue;
            
            // Check for collisions with aircraft (only for unguided missiles)
            if (!missile.target) {
                for (let j = 0; j < aircraft.length; j++) {
                    if (checkCollision(
                        {x: missile.x - MISSILE_SIZE/2, y: missile.y - MISSILE_SIZE/2, width: MISSILE_SIZE, height: MISSILE_SIZE},
                        {x: aircraft[j].x, y: aircraft[j].y, width: aircraft[j].width, height: aircraft[j].height}
                    )) {
                        aircraft[j].health -= MISSILE_DAMAGE;
                        createHitFlash(aircraft[j]);
                        
                        // Check if aircraft destroyed
                        if (aircraft[j].health <= 0) {
                            createExplosion(aircraft[j].x + aircraft[j].width/2, aircraft[j].y + aircraft[j].height/2);
                            aircraft.splice(j, 1);
                            score++;
                        }
                        
                        // Create explosion and remove missile
                        createExplosion(missile.x, missile.y);
                        missiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
        
        // Update SSMs
        updateSSMs();
        
        // Find lock-on target (prioritize aircraft)
        let potentialTarget = null;
        
        // First try to find an aircraft
        for (let i = 0; i < aircraft.length; i++) {
            if (isTargetUnderCrosshair(aircraft[i])) {
                potentialTarget = aircraft[i];
                potentialTarget.type = 'aircraft';
                break;
            }
        }
        
        // If no aircraft found, try ships
        if (!potentialTarget) {
            for (let i = 0; i < enemies.length; i++) {
                if (isTargetUnderCrosshair(enemies[i])) {
                    potentialTarget = enemies[i];
                    potentialTarget.type = 'enemy';
                    break;
                }
            }
        }
        
        // Handle lock-on and timing
        const currentTime = Date.now();
        if (potentialTarget) {
            if (lockOnTarget !== potentialTarget) {
                // Start lock-on process for new target
                lockOnTarget = potentialTarget;
                lockStartTime = currentTime;
            } else if (currentTime - lockStartTime < MISSILE_LOCK_TIME) {
                // Still locking on
            } else {
                // Lock complete, keep targeting
            }
        } else {
            // No target under crosshair
            lockOnTarget = null;
        }
        
        // Update explosions
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].time += 16; // Assuming ~60fps
            if (explosions[i].time >= EXPLOSION_DURATION) {
                explosions.splice(i, 1);
            }
        }
        
        // Update hit flashes
        for (let i = hitFlashes.length - 1; i >= 0; i--) {
            hitFlashes[i].duration -= 16;
            if (hitFlashes[i].duration <= 0) {
                hitFlashes.splice(i, 1);
            }
        }
        
        // Reset player hit state after time passes
        if (player.isHit && Date.now() - player.hitTime > HIT_FLASH_DURATION) {
            player.isHit = false;
        }
        
        // Spawn enemies periodically
        const now = Date.now();
        if (now - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
            spawnEnemy();
            lastEnemySpawnTime = now;
        }
        
        // Spawn aircraft periodically
        if (now - lastAircraftSpawnTime > AIRCRAFT_SPAWN_INTERVAL) {
            spawnAircraft();
            lastAircraftSpawnTime = now;
        }
    } catch (error) {
        console.error('Error in update:', error);
        showError(error);
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
    
    ssms.push({
        x: shipCenter.x,
        y: shipCenter.y,
        vx: (dx / distance) * MISSILE_SPEED,
        vy: (dy / distance) * MISSILE_SPEED,
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
            // Instead of using intersection point, calculate center of the target
            endX = enemy.x + enemy.width / 2;
            endY = enemy.y + enemy.height / 2;
            lockOnTarget = enemy;
            targetFound = true;
            break;
        }
    }
    
    if (!targetFound) {
        lockOnTarget = null;
    }
    
    // Only draw lock-on indicator - the targeting line is drawn in the main draw function
    if (lockOnTarget) {
        // Draw lock-on indicator
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.strokeRect(
            lockOnTarget.x - 2,
            lockOnTarget.y - 2,
            lockOnTarget.width + 4,
            lockOnTarget.height + 4
        );
    }

    // Draw crosshair (always show this)
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

// Draw SSMs
function drawSSMs() {
    ssms.forEach(ssm => {
        // Draw the SSM body
        ctx.fillStyle = SSM_COLOR;
        ctx.beginPath();
        ctx.arc(ssm.x, ssm.y, SSM_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the radar cone if radar is active
        if (ssm.radarActive) {
            // Calculate the radar cone vertices
            const coneLength = SSM_RADAR_RANGE;
            const coneWidth = Math.tan(SSM_RADAR_ANGLE / 2) * coneLength;
            
            // Draw radar cone
            ctx.beginPath();
            ctx.moveTo(ssm.x, ssm.y);
            ctx.lineTo(ssm.x + coneLength, ssm.y - coneWidth);
            ctx.lineTo(ssm.x + coneLength, ssm.y + coneWidth);
            ctx.closePath();
            
            // Fill with a semi-transparent orange gradient
            const gradient = ctx.createRadialGradient(
                ssm.x, ssm.y, 0,
                ssm.x, ssm.y, coneLength
            );
            gradient.addColorStop(0, 'rgba(255, 165, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 165, 0, 0.0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
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
    
    // Draw targeting vector first (before enemies) so it appears behind targets
    if (lockOnTarget) {
        const shipCenter = {
            x: player.x + player.width,
            y: player.y + player.height / 2
        };
        
        // Calculate center of target
        const targetCenter = {
            x: lockOnTarget.x + lockOnTarget.width / 2,
            y: lockOnTarget.y + lockOnTarget.height / 2
        };
        
        // Draw the targeting line
        ctx.beginPath();
        ctx.moveTo(shipCenter.x, shipCenter.y);
        ctx.lineTo(targetCenter.x, targetCenter.y);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw enemies with hit flash effect
    drawEnemies();
    drawAircraft();
    
    // Draw targeting vector (now only drawing crosshair and lock-on box)
    drawTargetingVector();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw missiles
    drawMissiles();
    
    // Draw SSMs
    drawSSMs();
    
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
    explosions.forEach(explosion => {
        const alpha = 1 - (explosion.time / EXPLOSION_DURATION);
        explosion.particles.forEach(particle => {
            ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            // Update particle position based on time passed
            const posX = particle.x + particle.dx * (explosion.time / 16);
            const posY = particle.y + particle.dy * (explosion.time / 16);
            ctx.arc(posX, posY, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
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
    
    // SSM count
    ctx.fillText(`SSMs: ${player.ssms}`, 15, 65);
    
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
    
    // Draw title - moved up 100px
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BATTLESHIPS', CANVAS_WIDTH/2, CANVAS_HEIGHT/4 - 100);
    
    // Draw name entry interface - moved up 200px
    ctx.font = '30px Arial';
    ctx.fillText('Enter Your Name:', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 240);
    
    // Draw name entry box - moved up 200px
    const boxWidth = 300;
    const boxHeight = 60;
    const boxX = CANVAS_WIDTH/2 - boxWidth/2;
    const boxY = CANVAS_HEIGHT/2 - 200;
    
    // Draw box background
    ctx.fillStyle = '#000033';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw name with blinking cursor - moved up 200px
    const displayName = playerName + (Math.floor(Date.now() / 500) % 2 ? '_' : ' ');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px "Courier New"';  // Monospace font for arcade feel
    ctx.fillText(displayName.padEnd(NAME_MAX_LENGTH, '.'), CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 160);
    
    ctx.font = '20px Arial';
    ctx.fillText('Use A-Z and 0-9 • Press ENTER to Start', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 110);
    
    // Draw virtual keyboard if enabled
    if (VIRTUAL_KEYBOARD.enabled) {
        drawVirtualKeyboard();
        
        // Calculate position below the keyboard (keyboard height + padding)
        const keyboardHeight = VIRTUAL_KEYBOARD.keys.length * (VIRTUAL_KEYBOARD.keySize + VIRTUAL_KEYBOARD.padding);
        const buttonsY = (CANVAS_HEIGHT/2 - 80) + keyboardHeight + 30; // Position below keyboard with 30px padding
        
        // Add touch-friendly buttons with improved visibility
        const buttonWidth = 140; // Wider buttons
        const buttonHeight = 60; // Taller buttons
        const buttonSpacing = 30; // More space between buttons
        const totalWidth = buttonWidth * 2 + buttonSpacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2;
        
        // Draw Backspace button with improved visibility
        // Create gradient for backspace button
        const backspaceGradient = ctx.createLinearGradient(startX, buttonsY, startX, buttonsY + buttonHeight);
        backspaceGradient.addColorStop(0, '#FF4444');
        backspaceGradient.addColorStop(1, '#CC0000');
        ctx.fillStyle = backspaceGradient;
        ctx.fillRect(startX, buttonsY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3; // Thicker border
        ctx.strokeRect(startX, buttonsY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF'; // White text
        ctx.font = '24px Arial'; // Larger font
        ctx.textAlign = 'center';
        ctx.fillText('Backspace', startX + buttonWidth/2, buttonsY + buttonHeight/2 + 7);
        
        // Draw Enter button with improved visibility
        // Create gradient for enter button
        const enterGradient = ctx.createLinearGradient(
            startX + buttonWidth + buttonSpacing, 
            buttonsY, 
            startX + buttonWidth + buttonSpacing, 
            buttonsY + buttonHeight
        );
        enterGradient.addColorStop(0, playerName.length > 0 ? '#44FF44' : '#888888');
        enterGradient.addColorStop(1, playerName.length > 0 ? '#00CC00' : '#555555');
        ctx.fillStyle = enterGradient;
        ctx.fillRect(startX + buttonWidth + buttonSpacing, buttonsY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3; // Thicker border
        ctx.strokeRect(startX + buttonWidth + buttonSpacing, buttonsY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF'; // White text
        ctx.font = '28px Arial'; // Even larger font for Enter
        ctx.fillText('Enter', startX + buttonWidth + buttonSpacing + buttonWidth/2, buttonsY + buttonHeight/2 + 7);
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
    ctx.fillText('Restart Game (R)', CANVAS_WIDTH/2, buttonY + buttonHeight/2);
    
    // Store button coordinates for touch/click detection
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
            
            // Now that name entry is complete, set up joysticks if enabled
            if (JOYSTICK_CONTROLS.enabled) {
                setupJoysticks();
            }
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
    player.ssms = SSM_MAX_COUNT; // Reset SSM count
    player.x = 50;
    player.y = CANVAS_HEIGHT * 2/3;
    
    projectiles = [];
    enemyProjectiles = [];
    enemies = [];
    aircraft = [];
    missiles = [];
    ssms = []; // Clear SSMs
    explosions = [];
    hitFlashes = [];
    score = 0;  // Reset score
    
    // Clean up joysticks when resetting the game
    if (joysticks.movement) {
        joysticks.movement.destroy();
        joysticks.movement = null;
    }
    if (joysticks.action) {
        joysticks.action.destroy();
        joysticks.action = null;
    }
    
    // Remove any existing missile button
    const existingMissileBtn = document.getElementById('missileButton');
    if (existingMissileBtn) {
        document.body.removeChild(existingMissileBtn);
    }
    
    // Remove any existing SSM button
    const existingSsmBtn = document.getElementById('ssmButton');
    if (existingSsmBtn) {
        document.body.removeChild(existingSsmBtn);
    }
    
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
    explosions.push({
        x: x,
        y: y,
        particles: Array.from({ length: EXPLOSION_PARTICLES }, (_, i) => {
            const angle = (Math.PI * 2 / EXPLOSION_PARTICLES) * i;
            const speed = 2 + Math.random() * 2;
            return {
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)]
            };
        }),
        time: 0
    });
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
    console.log("Touch start event detected");
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    // Log the touch for debugging
    Array.from(e.touches).forEach(touch => {
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        console.log(`Touch at: (${x}, ${y}), isEnteringName: ${isEnteringName}`);
        
        if (gameOver) {
            const button = gameOver.restartButton;
            if (button && x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                resetGame();
                triggerHapticFeedback(50);
                return;
            }
            return; // Don't process other touches if game is over
        }
        
        if (isEnteringName) {
            console.log("Processing touch for name entry");
            handleVirtualKeyboardTouch(x, y);
            return; // Stop processing once we've handled the name entry
        } else {
            // Update aim position if touch is in front of the ship
            if (x > player.x + player.width) {  // Only if touch is to the right of the ship
                mouse.x = x;
                mouse.y = y;
            }
        }
    });
}

// Add virtual keyboard touch handling
function handleVirtualKeyboardTouch(x, y) {
    console.log("Virtual keyboard touch at:", x, y);
    
    const keySize = Math.max(VIRTUAL_KEYBOARD.keySize, MOBILE_SETTINGS.minimumTouchSize);
    const padding = VIRTUAL_KEYBOARD.padding;
    const startY = CANVAS_HEIGHT/2 - 80; // Updated to match drawVirtualKeyboard
    
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
                    console.log("Key pressed:", key);
                }
            }
        });
    });
    
    // Calculate position below the keyboard (keyboard height + padding)
    const keyboardHeight = VIRTUAL_KEYBOARD.keys.length * (keySize + padding);
    const buttonsY = startY + keyboardHeight + 30; // Position below keyboard with 30px padding
    
    // Match button dimensions with drawNameEntry function
    const buttonWidth = 140;
    const buttonHeight = 60;
    const buttonSpacing = 30;
    const totalWidth = buttonWidth * 2 + buttonSpacing;
    const buttonsStartX = (CANVAS_WIDTH - totalWidth) / 2;
    
    console.log("Backspace button bounds:", 
                buttonsStartX, buttonsY, 
                buttonsStartX + buttonWidth, buttonsY + buttonHeight);
    
    // Backspace button
    if (x >= buttonsStartX && x < buttonsStartX + buttonWidth &&
        y >= buttonsY && y < buttonsY + buttonHeight) {
        playerName = playerName.slice(0, -1);
        keyPressed = true;
        console.log("Backspace pressed");
    }
    
    console.log("Enter button bounds:", 
                buttonsStartX + buttonWidth + buttonSpacing, buttonsY,
                buttonsStartX + buttonWidth * 2 + buttonSpacing, buttonsY + buttonHeight);
                
    // Enter button
    if (x >= buttonsStartX + buttonWidth + buttonSpacing && 
        x < buttonsStartX + buttonWidth * 2 + buttonSpacing &&
        y >= buttonsY && y < buttonsY + buttonHeight) {
        console.log("Enter button touched");
        if (playerName.length > 0) {
            console.log("Starting game with name:", playerName);
            isEnteringName = false;
            gameStarted = true;
            updateCursorVisibility();
            // Set up joysticks now that we're starting the game
            if (JOYSTICK_CONTROLS.enabled) {
                setupJoysticks();
            }
            keyPressed = true;
        }
    }
    
    if (keyPressed) {
        triggerHapticFeedback(25);
    }
}

// Add virtual keyboard drawing function
function drawVirtualKeyboard() {
    const startY = CANVAS_HEIGHT/2 - 80; // Changed from +120 to -80 (moved up 200px)
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

// Add touch event handlers after handleTouchStart
function handleTouchMove(e) {
    if (!isEnteringName) return;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!isEnteringName) return;
    e.preventDefault();
}

// Simplify touch event handlers to only handle virtual keyboard during name entry
function handleTouchMove(e) {
    if (!isEnteringName) return;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!isEnteringName) return;
    e.preventDefault();
}

// Remove drawTouchControls function

// Update draw function to remove touch controls rendering
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isEnteringName) {
        drawNameEntry();
        return;
    }
    
    // Draw environment first
    drawEnvironment();
    
    // Draw targeting vector first (before enemies) so it appears behind targets
    if (lockOnTarget) {
        const shipCenter = {
            x: player.x + player.width,
            y: player.y + player.height / 2
        };
        
        // Calculate center of target
        const targetCenter = {
            x: lockOnTarget.x + lockOnTarget.width / 2,
            y: lockOnTarget.y + lockOnTarget.height / 2
        };
        
        // Draw the targeting line
        ctx.beginPath();
        ctx.moveTo(shipCenter.x, shipCenter.y);
        ctx.lineTo(targetCenter.x, targetCenter.y);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw enemies with hit flash effect
    drawEnemies();
    drawAircraft();
    
    // Draw targeting vector (now only drawing crosshair and lock-on box)
    drawTargetingVector();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw missiles
    drawMissiles();
    
    // Draw SSMs
    drawSSMs();
    
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
    explosions.forEach(explosion => {
        const alpha = 1 - (explosion.time / EXPLOSION_DURATION);
        explosion.particles.forEach(particle => {
            ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            // Update particle position based on time passed
            const posX = particle.x + particle.dx * (explosion.time / 16);
            const posY = particle.y + particle.dy * (explosion.time / 16);
            ctx.arc(posX, posY, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    // Draw UI elements
    drawUI();
    
    // Draw game over screen if needed
    if (gameOver) {
        drawGameOver();
    }
}

// Update resetGame to clean up joysticks
function resetGame() {
    player.health = 100;
    player.missiles = MISSILE_MAX_COUNT;
    player.ssms = SSM_MAX_COUNT; // Reset SSM count
    player.x = 50;
    player.y = CANVAS_HEIGHT * 2/3;
    
    projectiles = [];
    enemyProjectiles = [];
    enemies = [];
    aircraft = [];
    missiles = [];
    ssms = []; // Clear SSMs
    explosions = [];
    hitFlashes = [];
    score = 0;  // Reset score
    
    // Clean up joysticks when resetting the game
    if (joysticks.movement) {
        joysticks.movement.destroy();
        joysticks.movement = null;
    }
    if (joysticks.action) {
        joysticks.action.destroy();
        joysticks.action = null;
    }
    
    // Remove any existing missile button
    const existingMissileBtn = document.getElementById('missileButton');
    if (existingMissileBtn) {
        document.body.removeChild(existingMissileBtn);
    }
    
    isEnteringName = true;  // Go back to name entry
    playerName = '';        // Clear the name
    gameStarted = false;    // Reset game started flag
    gameOver = false;
}

// Fire Ship-to-Ship Missile
function fireSSM() {
    const shipCenter = {
        x: player.x + player.width,
        y: player.y + player.height / 2
    };
    
    // SSM always fires straight ahead
    ssms.push({
        x: shipCenter.x,
        y: shipCenter.y,
        vx: SSM_SPEED,
        vy: 0,
        launchTime: Date.now(),
        radarActive: false,
        target: null
    });
}

// Update Ship-to-Ship Missiles
function updateSSMs() {
    for (let i = ssms.length - 1; i >= 0; i--) {
        const ssm = ssms[i];
        const currentTime = Date.now();
        
        // Check if radar should be activated
        if (!ssm.radarActive && currentTime - ssm.launchTime >= SSM_RADAR_ACTIVATION_TIME) {
            ssm.radarActive = true;
        }
        
        // If radar is active and no target, scan for targets
        if (ssm.radarActive && !ssm.target) {
            // Scan for enemies inside the radar cone
            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                
                // Calculate enemy center position
                const enemyCenter = {
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2
                };
                
                // Calculate distance and angle to enemy
                const dx = enemyCenter.x - ssm.x;
                const dy = enemyCenter.y - ssm.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Skip if enemy is behind SSM or too far
                if (dx < 0 || distance > SSM_RADAR_RANGE) continue;
                
                // Calculate angle (in radians) between SSM heading and enemy position
                // Since SSM flies straight ahead, its heading is 0 radians (right)
                const angle = Math.abs(Math.atan2(dy, dx));
                
                // Check if enemy is within the radar cone
                if (angle <= SSM_RADAR_ANGLE / 2) {
                    ssm.target = enemy;
                    ssm.targetType = 'enemy';
                    break;
                }
            }
            
            // If no enemy found, check aircraft
            if (!ssm.target) {
                for (let j = 0; j < aircraft.length; j++) {
                    const craft = aircraft[j];
                    
                    // Calculate aircraft center position
                    const craftCenter = {
                        x: craft.x + craft.width / 2,
                        y: craft.y + craft.height / 2
                    };
                    
                    // Calculate distance and angle to aircraft
                    const dx = craftCenter.x - ssm.x;
                    const dy = craftCenter.y - ssm.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Skip if aircraft is behind SSM or too far
                    if (dx < 0 || distance > SSM_RADAR_RANGE) continue;
                    
                    // Calculate angle (in radians) between SSM heading and aircraft position
                    const angle = Math.abs(Math.atan2(dy, dx));
                    
                    // Check if aircraft is within the radar cone
                    if (angle <= SSM_RADAR_ANGLE / 2) {
                        ssm.target = craft;
                        ssm.targetType = 'aircraft';
                        break;
                    }
                }
            }
        }
        
        // If SSM has a target, update its movement
        if (ssm.target) {
            // Calculate target center
            const targetCenterX = ssm.target.x + ssm.target.width / 2;
            const targetCenterY = ssm.target.y + ssm.target.height / 2;
            
            // Calculate direction to target
            const dx = targetCenterX - ssm.x;
            const dy = targetCenterY - ssm.y;
            const distToTarget = Math.sqrt(dx * dx + dy * dy);
            
            // Check if we've hit the target
            if (distToTarget < SSM_MIN_DISTANCE) {
                // Deal damage
                ssm.target.health -= SSM_DAMAGE;
                createHitFlash(ssm.target);
                
                // Check if target is destroyed
                if (ssm.target.health <= 0) {
                    if (ssm.targetType === 'aircraft') {
                        const index = aircraft.indexOf(ssm.target);
                        if (index !== -1) {
                            createExplosion(
                                aircraft[index].x + aircraft[index].width/2, 
                                aircraft[index].y + aircraft[index].height/2
                            );
                            aircraft.splice(index, 1);
                            score++;
                        }
                    } else { // enemy ship
                        const index = enemies.indexOf(ssm.target);
                        if (index !== -1) {
                            createExplosion(
                                enemies[index].x + enemies[index].width/2, 
                                enemies[index].y + enemies[index].height/2
                            );
                            enemies.splice(index, 1);
                            score++;
                        }
                    }
                }
                
                // Create explosion and remove SSM
                createExplosion(ssm.x, ssm.y);
                ssms.splice(i, 1);
                continue;
            }
            
            // Normalize direction
            const normalizedDx = dx / distToTarget;
            const normalizedDy = dy / distToTarget;
            
            // Apply homing behavior (less agile than regular missiles)
            const turnRate = SSM_TURN_SPEED;
            
            // Gradually adjust velocity toward target
            ssm.vx = ssm.vx + normalizedDx * turnRate;
            ssm.vy = ssm.vy + normalizedDy * turnRate;
            
            // Normalize velocity to maintain consistent speed
            const newMagnitude = Math.sqrt(ssm.vx * ssm.vx + ssm.vy * ssm.vy);
            ssm.vx = (ssm.vx / newMagnitude) * SSM_SPEED;
            ssm.vy = (ssm.vy / newMagnitude) * SSM_SPEED;
        }
        
        // Update position
        ssm.x += ssm.vx;
        ssm.y += ssm.vy;
        
        // Remove SSMs that go off screen
        if (ssm.x > CANVAS_WIDTH || 
            ssm.x < 0 || 
            ssm.y > CANVAS_HEIGHT || 
            ssm.y < 0) {
            ssms.splice(i, 1);
        }
    }
}