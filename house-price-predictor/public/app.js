document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('predict-btn');
    const resultSection = document.getElementById('result-section');
    const priceReveal = document.getElementById('price-reveal');
    const errorMessage = document.getElementById('error-message');

    // The backend API URL. 
    // Uses absolute path `/api/predict` in production (Vercel routes)
    // and localhost:5000/predict for local development fallback if not served together.
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/predict' 
        : '/api/predict';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide old results/errors
        resultSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        // Gather real-world inputs
        const medInc = document.getElementById('medInc').value;
        const houseAge = document.getElementById('houseAge').value;
        const aveRooms = document.getElementById('aveRooms').value;
        const aveBedrms = document.getElementById('aveBedrms').value;

        const requestData = {
            medInc: parseFloat(medInc),
            houseAge: parseFloat(houseAge),
            aveRooms: parseFloat(aveRooms),
            aveBedrms: parseFloat(aveBedrms)
        };

        // UI Loading State Call
        setLoadingState(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to predict price.');
            }

            // Success! Animate the result.
            showResult(data.predicted_price, data.formatted_price);

        } catch (error) {
            console.error('Prediction Error:', error);
            showError("We encountered an issue reaching the AI backend. Please make sure the server is running or try again.");
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
        
        // Auto-hide error after 5s
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    function showResult(numPrice, textPrice) {
        resultSection.classList.remove('hidden');
        
        // Fast counter animation for ultra-premium feel
        animateValue(priceReveal, 0, numPrice, 1200);
    }

    // Number counting animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function outExpo
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            const currentVal = start + easeOutExpo * (end - start);
            
            // Format currency dynamically
            obj.innerHTML = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(currentVal);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Final exact value at the end
                obj.innerHTML = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(end);
            }
        };
        window.requestAnimationFrame(step);
    }
});
