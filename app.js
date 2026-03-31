document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('predict-btn');
    const resultSection = document.getElementById('result-section');
    const priceReveal = document.getElementById('price-reveal');
    const errorMessage = document.getElementById('error-message');

    // Dynamically point to /api/predict in production, or localhost:5000 in dev
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/predict' 
        : '/api/predict';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset UI Context
        resultSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        // Capture user inputs from elegant minimal form
        const requestData = {
            medInc: parseFloat(document.getElementById('medInc').value),
            houseAge: parseFloat(document.getElementById('houseAge').value),
            aveRooms: parseFloat(document.getElementById('aveRooms').value),
            aveBedrms: parseFloat(document.getElementById('aveBedrms').value)
        };

        setLoadingState(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server error computing prediction.');
            }

            // Beautiful UI price intro!
            showResult(data.predicted_price);

        } catch (error) {
            console.error('Prediction Engine Error:', error);
            showError("Network anomaly detected. Ensure backend is reachable and try again.");
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }

    function showResult(numPrice) {
        resultSection.classList.remove('hidden');
        
        // Exquisite slot-machine counter animation for the huge numbers!
        animateValue(priceReveal, 0, numPrice, 1500);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Quintic easing out creates a dramatic "slow down" at the end (looks extremely premium)
            const easeOutQuint = 1 - Math.pow(1 - progress, 5);
            
            const currentVal = start + easeOutQuint * (end - start);
            
            obj.innerHTML = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(currentVal);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Ensure exact floating point value displayed upon end
                obj.innerHTML = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(end);
            }
        };
        window.requestAnimationFrame(step);
    }
});
