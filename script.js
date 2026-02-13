// State
let currentSlide = 0;
const totalSlides = 8;
let noButtonClicks = 0;
let noButtonDodges = 0;

// DOM Elements
const pages = {
    letter: document.getElementById('letterPage'),
    slideshow: document.getElementById('slideshowPage'),
    question: document.getElementById('questionPage'),
    celebration: document.getElementById('celebrationPage')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    setupLetterPage();
    setupSlideshow();
    setupEventListeners();
});

// Letter page - click to open with animation
function setupLetterPage() {
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    const tapHint = document.querySelector('.tap-hint');

    envelopeWrapper.addEventListener('click', () => {
        // Start opening animation
        envelopeWrapper.classList.add('opening');

        // Hide the tap hint
        if (tapHint) {
            tapHint.style.opacity = '0';
        }

        // After letter slides out, fade everything and transition
        setTimeout(() => {
            envelopeWrapper.classList.add('fade-out');
        }, 1400);

        // Go to slideshow
        setTimeout(() => {
            goToPage('slideshow');
        }, 2000);
    });
}

// Create floating hearts background
function createFloatingHearts() {
    const container = document.getElementById('heartsBackground');
    const hearts = ['💕', '💗', '💖', '💘', '❤️', '💝'];

    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 6 + 's';
        heart.style.animationDuration = (5 + Math.random() * 3) + 's';
        container.appendChild(heart);
    }
}

// Slideshow functionality
function setupSlideshow() {
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        } else {
            // Last slide - go to question page
            goToPage('question');
            setupNoButton();
        }
    });

    // Click on dots to navigate
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index <= currentSlide + 1) { // Allow forward by 1 or any previous
                goToSlide(index);
            }
        });
    });
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.getElementById('nextBtn');

    // Remove active from current
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    dots[currentSlide].classList.add('completed');

    // Set new current
    currentSlide = index;

    // Add active to new
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.remove('completed');
    dots[currentSlide].classList.add('active');

    // Update button text on last slide
    if (currentSlide === totalSlides - 1) {
        nextBtn.textContent = 'Continue 💕';
    } else {
        nextBtn.textContent = 'Next →';
    }
}

// Page navigation
function goToPage(pageName) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageName].classList.add('active');

    if (pageName === 'celebration') {
        startCelebration();
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('yesBtn').addEventListener('click', () => {
        goToPage('celebration');
    });
}

// No button behavior
function setupNoButton() {
    const noBtn = document.getElementById('noBtn');
    const questionPage = document.getElementById('questionPage');

    // Reset state
    noButtonClicks = 0;
    noButtonDodges = 0;
    noBtn.className = 'btn no-btn';
    noBtn.textContent = 'No';
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';

    // Mouse/touch move handler for dodging
    const handleMove = (e) => {
        const rect = noBtn.getBoundingClientRect();
        let clientX, clientY;

        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const distance = Math.hypot(clientX - btnCenterX, clientY - btnCenterY);

        // If close enough, dodge!
        if (distance < 100 && noButtonClicks < 3) {
            dodgeButton(noBtn, clientX, clientY);
        }
    };

    questionPage.addEventListener('mousemove', handleMove);
    questionPage.addEventListener('touchmove', handleMove, { passive: true });

    // Click handler
    noBtn.addEventListener('click', () => {
        noButtonClicks++;

        if (noButtonClicks === 1) {
            noBtn.classList.add('shrinking');
            noBtn.textContent = 'Are you sure?';
        } else if (noButtonClicks === 2) {
            noBtn.classList.remove('shrinking');
            noBtn.classList.add('tiny');
            noBtn.textContent = 'Really?';
            addExtraYesButton();
        } else if (noButtonClicks >= 3) {
            noBtn.classList.add('hidden');
            addExtraYesButton();
            addExtraYesButton();
            addExtraYesButton();
        }
    });
}

// Dodge the button away from cursor/touch
function dodgeButton(btn, cursorX, cursorY) {
    noButtonDodges++;

    const btnRect = btn.getBoundingClientRect();

    // Make button position absolute if not already
    if (btn.style.position !== 'absolute') {
        btn.style.position = 'absolute';
        btn.style.left = btnRect.left + 'px';
        btn.style.top = btnRect.top + 'px';
    }

    // Calculate new position away from cursor
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    // Direction away from cursor
    const angle = Math.atan2(btnCenterY - cursorY, btnCenterX - cursorX);
    const distance = 150 + Math.random() * 100;

    let newX = btnCenterX + Math.cos(angle) * distance - btnRect.width / 2;
    let newY = btnCenterY + Math.sin(angle) * distance - btnRect.height / 2;

    // Keep within bounds
    const padding = 20;
    newX = Math.max(padding, Math.min(window.innerWidth - btnRect.width - padding, newX));
    newY = Math.max(padding, Math.min(window.innerHeight - btnRect.height - padding, newY));

    // If cornered, teleport to random location
    if (noButtonDodges > 5) {
        newX = padding + Math.random() * (window.innerWidth - btnRect.width - padding * 2);
        newY = padding + Math.random() * (window.innerHeight - btnRect.height - padding * 2);
    }

    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';

    // After many dodges, add Yes buttons
    if (noButtonDodges > 8 && noButtonDodges % 3 === 0) {
        addExtraYesButton();
    }
}

// Add extra Yes buttons
function addExtraYesButton() {
    const container = document.getElementById('extraYesButtons');
    const messages = ['Yes!', 'Okay fine, yes!', 'YES! 💕', 'Definitely yes!', 'Obviously yes!', 'Yes please!', 'Yesss!'];

    const btn = document.createElement('button');
    btn.className = 'extra-yes-btn';
    btn.textContent = messages[Math.floor(Math.random() * messages.length)];
    btn.addEventListener('click', () => {
        goToPage('celebration');
    });

    container.appendChild(btn);
}

// Celebration effects
function startCelebration() {
    createHeartsExplosion();
    startConfetti();
}

// Hearts explosion
function createHeartsExplosion() {
    const container = document.getElementById('heartsExplosion');
    container.innerHTML = '';

    const hearts = ['💕', '💗', '💖', '💘', '❤️', '💝', '💓', '💞'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 30; i++) {
        const heart = document.createElement('div');
        heart.className = 'explosion-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = centerX + 'px';
        heart.style.top = centerY + 'px';

        // Random direction
        const angle = (Math.PI * 2 * i) / 30;
        const distance = 200 + Math.random() * 300;
        const tx = Math.cos(angle) * distance + 'px';
        const ty = Math.sin(angle) * distance + 'px';
        const rot = (Math.random() - 0.5) * 720 + 'deg';

        heart.style.setProperty('--tx', tx);
        heart.style.setProperty('--ty', ty);
        heart.style.setProperty('--rot', rot);
        heart.style.animationDelay = Math.random() * 0.3 + 's';

        container.appendChild(heart);
    }
}

// Confetti
function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#d63384', '#e91e8c', '#ff69b4', '#ff1493', '#28a745', '#ffd700', '#ff6b6b'];

    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2,
            drift: (Math.random() - 0.5) * 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeConfetti = 0;

        confetti.forEach(c => {
            if (c.y < canvas.height + 50) {
                activeConfetti++;

                c.y += c.speed;
                c.x += c.drift;
                c.angle += c.spin;

                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.angle);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                ctx.restore();
            }
        });

        if (activeConfetti > 0) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
