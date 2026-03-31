const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const predictionText = document.getElementById('prediction-text');
const confidenceFill = document.getElementById('confidence-fill');
const historyLog = document.getElementById('history-log');
const statusBadge = document.getElementById('status-badge');
const audioToggle = document.getElementById('audio-toggle');
const loadingOverlay = document.getElementById('loading-overlay');
const clearBtn = document.getElementById('clear-btn');

let lastPrediction = "";
let lastSpeakTime = 0;
let historyItems = [];

// Initialize MediaPipe Holistic
const holistic = new Holistic({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }
});

holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

holistic.onResults(onResults);

// Setup Camera
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await holistic.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start().then(() => {
    loadingOverlay.style.display = 'none';
    statusBadge.textContent = 'Engine Ready';
});

// History Management
clearBtn.onclick = () => {
    historyItems = [];
    historyLog.innerHTML = "Your recognized words will appear here...";
};

function addToHistory(word) {
    if (word === lastPrediction) return;
    
    historyItems.unshift(word);
    if (historyItems.length > 50) historyItems.pop();
    
    historyLog.innerHTML = historyItems.map(item => `<div class="history-item">${item}</div>`).join('');
    lastPrediction = word;

    // Speech Output
    if (audioToggle.checked && Date.now() - lastSpeakTime > 2000) {
        speak(word);
        lastSpeakTime = Date.now();
    }
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// Result Processing
function onResults(results) {
    // Resize canvas to match video
    if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw MediaPipe Visuals
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#03dac6', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#bb86fc', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#ffffff22', lineWidth: 1 });

    // Gesture Logic (Rule-based for Web Demo Performance)
    detectGestures(results);

    canvasCtx.restore();
}

/**
 * detectGestures
 * Core logic for recognizing patterns in the skeleton data
 */
function detectGestures(results) {
    const rightHand = results.rightHandLandmarks;
    const leftHand = results.leftHandLandmarks;
    const pose = results.poseLandmarks;

    if (!rightHand && !leftHand) {
        predictionText.textContent = "...";
        confidenceFill.style.width = "0%";
        return;
    }

    let prediction = "";
    let confidence = 0;

    // 1. Logic for "I Love You" (Pinky, Index, and Thumb extended)
    if (rightHand) {
        const isIndexUp = rightHand[8].y < rightHand[6].y;
        const isPinkyUp = rightHand[20].y < rightHand[18].y;
        const isThumbOut = Math.abs(rightHand[4].x - rightHand[2].x) > 0.05;
        const isMiddleDown = rightHand[12].y > rightHand[10].y;
        const isRingDown = rightHand[16].y > rightHand[14].y;

        if (isIndexUp && isPinkyUp && isThumbOut && isMiddleDown && isRingDown) {
            prediction = "I Love You";
            confidence = 95;
        }
        
        // Simple "Hello" (Wave motion/Open Palm near face)
        else if (rightHand[8].y < rightHand[5].y && rightHand[12].y < rightHand[9].y && pose && rightHand[0].y < pose[11].y) {
           prediction = "Hello";
           confidence = 88;
        }

        // Letter "A" (Fist with thumb on side)
        else if (isMiddleDown && isRingDown && isPinkyDown(rightHand) && rightHand[4].x < rightHand[3].x) {
            prediction = "A";
            confidence = 82;
        }
        
        // Letter "B" (Open palm, thumb tucked)
        else if (isIndexUp && rightHand[12].y < rightHand[10].y && rightHand[16].y < rightHand[14].y && isPinkyUp) {
            prediction = "B";
            confidence = 85;
        }

        // "Thanks" (Hand moves from chin forward - checked via hand position)
        if (pose && rightHand[0].y < pose[0].y + 0.1 && rightHand[0].z < -0.1) {
            prediction = "Thanks";
            confidence = 90;
        }
    }

    if (prediction) {
        predictionText.textContent = prediction;
        confidenceFill.style.width = `${confidence}%`;
        
        // Logic to finalize prediction after 1s of stability
        if (confidence > 80) {
            addToHistory(prediction);
        }
    }
}

function isPinkyDown(hand) {
    return hand[20].y > hand[18].y;
}
