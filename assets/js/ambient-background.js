// Ambient Canvas Background - Dual Animation System
// Cycles between Flowing Pipes and ROS2 Terminal Output

'use strict';

// Animation mode control
let currentMode = 'terminal'; // 'pipes' or 'terminal'
let modeStartTime = Date.now();
const modeDuration = 15000; // 15 seconds per animation

// Math helper constants
const TO_RAD = Math.PI / 180;
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;

// Pipe configuration
const pipeCount = 35;
const pipePropCount = 8;
const pipePropsLength = pipeCount * pipePropCount;
const turnCount = 8;
const turnAmount = (360 / turnCount) * TO_RAD;
const turnChanceRange = 20;
const baseSpeed = 0.5;
const rangeSpeed = 1;
const baseTTL = 100;
const rangeTTL = 300;
const baseWidth = 2;
const rangeWidth = 4;
const baseHue = 0; // Red base
const rangeHue = 10;

const fadeConst = 0.25;
const glowValue = 0.1;

let canvas;
let ctx;
let center;
let tick;
let pipeProps;

// Terminal configuration
let terminalLines = [];
let terminalScroll = 0;
let lastMessageTime = 0;
let messageInterval = 50; // ms between messages

const ROS2_MESSAGES = [
    { type: 'INFO', node: 'robot_state_publisher', msg: 'Publishing robot state transforms' },
    { type: 'INFO', node: 'motor_controller', msg: 'Motor velocities updated [0.45, -0.32, 0.78]' },
    { type: 'WARN', node: 'lidar_node', msg: 'Point cloud filtering threshold exceeded' },
    { type: 'INFO', node: 'navigation', msg: 'Planning path to goal position [2.4, -1.2, 0.0]' },
    { type: 'INFO', node: 'camera_driver', msg: 'Image captured at 30 FPS, resolution 1920x1080' },
    { type: 'DEBUG', node: 'imu_filter', msg: 'Orientation quaternion: [0.02, -0.01, 0.99, 0.12]' },
    { type: 'INFO', node: 'joint_controller', msg: 'Joint positions: [1.57, 0.78, -0.45, 2.10]' },
    { type: 'WARN', node: 'battery_monitor', msg: 'Battery level at 23%, return to charging station' },
    { type: 'INFO', node: 'localization', msg: 'AMCL pose estimate: x=1.23 y=-0.45 theta=0.78' },
    { type: 'ERROR', node: 'gripper_control', msg: 'Gripper pressure sensor timeout' },
    { type: 'INFO', node: 'slam_toolbox', msg: 'Map updated, 1847 occupied cells' },
    { type: 'INFO', node: 'path_planner', msg: 'A* search completed in 12ms, 34 waypoints' },
    { type: 'DEBUG', node: 'sensor_fusion', msg: 'Kalman filter converged, error: 0.003m' },
    { type: 'INFO', node: 'obstacle_detector', msg: 'Detected 3 obstacles within safety zone' },
    { type: 'INFO', node: 'arm_controller', msg: 'Trajectory execution 78% complete' },
    { type: 'WARN', node: 'network_monitor', msg: 'Latency spike detected: 145ms' },
    { type: 'INFO', node: 'tf2_buffer', msg: 'Transform tree updated, 12 frames active' },
    { type: 'INFO', node: 'motion_planner', msg: 'Velocity constraints satisfied, proceeding' },
];

// Helper functions
function rand(n) {
    return Math.random() * n;
}

function round(n) {
    return Math.round(n);
}

function fadeInOut(t, m) {
    let hm = fadeConst * m;
    return Math.abs((t + hm) % m - hm) / hm;
}

function setup() {
    createCanvas();
    resize();
    initPipes();
    initTerminal();
    draw();
}

// ===== PIPES ANIMATION =====

function initPipes() {
    pipeProps = new Float32Array(pipePropsLength);

    for (let i = 0; i < pipePropsLength; i += pipePropCount) {
        initPipe(i);
    }
}

function initPipe(i) {
    let x, y, direction, speed, life, ttl, width, hue;

    x = rand(canvas.width);
    y = center[1];
    direction = round(rand(1)) ? HALF_PI : TAU - HALF_PI;
    speed = baseSpeed + rand(rangeSpeed);
    life = 0;
    ttl = baseTTL + rand(rangeTTL);
    width = baseWidth + rand(rangeWidth);
    hue = baseHue + rand(rangeHue);

    pipeProps.set([x, y, direction, speed, life, ttl, width, hue], i);
}

function updatePipes() {
    tick++;

    for (let i = 0; i < pipePropsLength; i += pipePropCount) {
        updatePipe(i);
    }
}

function updatePipe(i) {
    let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i;
    let x, y, direction, speed, life, ttl, width, hue, turnChance, turnBias;

    x = pipeProps[i];
    y = pipeProps[i2];
    direction = pipeProps[i3];
    speed = pipeProps[i4];
    life = pipeProps[i5];
    ttl = pipeProps[i6];
    width = pipeProps[i7];
    hue = pipeProps[i8];

    drawPipe(x, y, life, ttl, width, hue);

    life++;
    x += Math.cos(direction) * speed;
    y += Math.sin(direction) * speed;
    turnChance = !(tick % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
    turnBias = round(rand(1)) ? -1 : 1;
    direction += turnChance ? turnAmount * turnBias : 0;

    pipeProps[i] = x;
    pipeProps[i2] = y;
    pipeProps[i3] = direction;
    pipeProps[i5] = life;

    checkBounds(i);
    if (life > ttl) initPipe(i);
}

function drawPipe(x, y, life, ttl, width, hue) {
    ctx.save();
    const fadeValue = fadeInOut(life, ttl) * glowValue;
    ctx.strokeStyle = `hsla(${hue}, 75%, 50%, ${fadeValue})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, width / 2, 0, TAU);
    ctx.stroke();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsla(${hue}, 75%, 50%, ${fadeValue * 0.8})`;
    ctx.strokeStyle = `hsla(${hue}, 75%, 60%, ${fadeValue * 0.5})`;
    ctx.stroke();

    ctx.restore();
}

function checkBounds(i) {
    let x = pipeProps[i];
    let y = pipeProps[i + 1];

    if (x > canvas.width) pipeProps[i] = 0;
    if (x < 0) pipeProps[i] = canvas.width;
    if (y > canvas.height) pipeProps[i + 1] = 0;
    if (y < 0) pipeProps[i + 1] = canvas.height;
}

function drawGrid() {
    const gridSize = 50;
    const offset = (tick * 0.3) % gridSize;

    ctx.strokeStyle = 'rgba(220, 38, 38, 0.04)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = -offset; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = -offset; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function renderPipes() {
    // Clear with slight trail effect for smoother flow
    ctx.save();
    ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw grid
    drawGrid();

    updatePipes();
}

// ===== TERMINAL ANIMATION =====

function initTerminal() {
    terminalLines = [];
    terminalScroll = 0;
    lastMessageTime = Date.now();
}

function getRandomMessage() {
    const msg = ROS2_MESSAGES[Math.floor(Math.random() * ROS2_MESSAGES.length)];
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return {
        timestamp,
        type: msg.type,
        node: msg.node,
        message: msg.msg,
        age: 0
    };
}

function updateTerminal() {
    const now = Date.now();

    // Add new messages
    if (now - lastMessageTime > messageInterval) {
        terminalLines.push(getRandomMessage());
        lastMessageTime = now;

        // Keep only visible lines (plus buffer)
        const maxLines = Math.floor(canvas.height / 18) + 10;
        if (terminalLines.length > maxLines) {
            terminalLines.shift();
        }
    }

    // Age all lines
    terminalLines.forEach(line => line.age++);
}

function renderTerminal() {
    // Clear background
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw terminal content
    ctx.font = '13px "JetBrains Mono", monospace';
    const lineHeight = 18;
    const startY = 30;
    const messageOpacity = 0.4;
    const logLevelOpacity = 0.3;

    terminalLines.forEach((line, i) => {
        const y = startY + (i * lineHeight) - terminalScroll;

        // Skip if off screen
        if (y < 0 || y > canvas.height) return;

        // Fade in effect for new lines
        const opacity = Math.min(1, line.age / 10);

        // Timestamp
        ctx.fillStyle = `rgba(100, 116, 139, ${opacity})`;
        ctx.fillText(`[${line.timestamp}]`, 20, y);

        // Log level with color
        let levelColor;
        switch(line.type) {
            case 'ERROR':
                levelColor = `rgba(220, 38, 38, ${opacity * logLevelOpacity})`;
                break;
            case 'WARN':
                levelColor = `rgba(251, 146, 60, ${opacity * logLevelOpacity})`;
                break;
            case 'INFO':
                levelColor = `rgba(34, 197, 94, ${opacity * logLevelOpacity})`;
                break;
            case 'DEBUG':
                levelColor = `rgba(59, 130, 246, ${opacity * logLevelOpacity})`;
                break;
            default:
                levelColor = `rgba(156, 163, 175, ${opacity * logLevelOpacity})`;
        }
        ctx.fillStyle = levelColor;
        ctx.fillText(`[${line.type}]`, 140, y);

        // Node name
        ctx.fillStyle = `rgba(147, 197, 253, ${opacity * messageOpacity})`;
        ctx.fillText(`[${line.node}]:`, 220, y);

        // Message
        ctx.fillStyle = `rgba(226, 232, 240, ${opacity*messageOpacity})`;
        const nodeWidth = ctx.measureText(`[${line.node}]: `).width;
        ctx.fillText(line.message, 220 + nodeWidth, y);
    });

    // Auto scroll
    if (terminalLines.length * lineHeight > canvas.height - startY) {
        terminalScroll = (terminalLines.length * lineHeight) - (canvas.height - startY - 20);
    }

    // Draw header
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(0, 0, canvas.width, 25);
    ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('ROS2 Node Output - /var/log/ros2/robot_system.log', 20, 16);
}

// ===== MAIN RENDER LOOP =====

function createCanvas() {
    canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    center = [];
    tick = 0;
}

function resize() {
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    center[0] = 0.5 * canvas.width;
    center[1] = 0.5 * canvas.height;
}

function checkModeSwitch() {
    const elapsed = Date.now() - modeStartTime;
    if (elapsed > modeDuration) {
        // Switch modes
        currentMode = currentMode === 'pipes' ? 'terminal' : 'pipes';
        modeStartTime = Date.now();

        // Reset terminal when switching to it
        if (currentMode === 'terminal') {
            initTerminal();
        }
    }
}

function draw() {
    if (!canvas) return;

    // Check if animations are disabled
    if (document.documentElement.classList.contains('reduce-motion')) {
        // Clear canvas and stop animation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    checkModeSwitch();

    if (currentMode === 'pipes') {
        renderPipes();
    } else {
        updateTerminal();
        renderTerminal();
    }

    requestAnimationFrame(draw);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
} else {
    setup();
}

window.addEventListener('resize', resize);
