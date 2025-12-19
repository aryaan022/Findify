// ===== FESTIVE CHRISTMAS & NEW YEAR EFFECTS =====

// Carousel functionality
class FestiveCarousel {
    constructor() {
        this.messages = [
            "🎄 Merry Christmas & Happy New Year! 🎄",
            "✨ Start Your Year with Local Discoveries ✨",
            "🎉 New Year, New Opportunities! 🎉",
            "🌟 Support Local Businesses This Holiday 🌟",
            "🎁 Celebrate with Your Favorite Businesses 🎁"
        ];
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.init();
    }

    init() {
        // Start autoplay
        this.startAutoplay();
        
        // Attach dot click handlers
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }

    displayMessage(index) {
        const messageElements = document.querySelectorAll('.carousel-message');
        
        messageElements.forEach((el, i) => {
            if (i === index) {
                el.classList.remove('hidden');
                el.style.animation = 'none';
                // Trigger reflow to restart animation
                void el.offsetWidth;
                el.style.animation = 'slideInLeft 0.6s ease-out, festiveGlow 2s ease-in-out infinite';
            } else {
                el.classList.add('hidden');
            }
        });

        // Update dots
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        this.currentIndex = index;
    }

    goToSlide(index) {
        this.displayMessage(index);
        this.resetAutoplay();
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.messages.length;
        this.displayMessage(nextIndex);
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change message every 5 seconds
    }

    resetAutoplay() {
        clearInterval(this.autoplayInterval);
        this.startAutoplay();
    }
}

// Snowfall functionality
class Snowfall {
    constructor() {
        this.isEnabled = localStorage.getItem('snowfallEnabled') !== 'false';
        this.container = null;
        this.init();
    }

    init() {
        // Create snowfall container
        this.container = document.createElement('div');
        this.container.className = 'snowfall-container';
        if (!this.isEnabled) {
            this.container.classList.add('snowfall-disabled');
        }
        document.body.insertBefore(this.container, document.body.firstChild);

        // Create toggle button
        this.createToggleButton();

        // Create snowflakes
        this.createSnowflakes();
    }

    createToggleButton() {
        const toggle = document.createElement('button');
        toggle.className = 'snowfall-toggle';
        toggle.innerHTML = '❄️';
        if (this.isEnabled) {
            toggle.classList.add('active');
        }
        toggle.setAttribute('title', this.isEnabled ? 'Disable Snowfall' : 'Enable Snowfall');
        
        toggle.addEventListener('click', () => {
            this.toggle();
            toggle.classList.toggle('active');
            toggle.setAttribute('title', this.isEnabled ? 'Disable Snowfall' : 'Enable Snowfall');
        });

        document.body.appendChild(toggle);
    }

    createSnowflakes() {
        const snowflakeCount = window.innerWidth > 768 ? 50 : 30;

        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            
            const size = Math.random() * 5 + 5;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 2;
            const left = Math.random() * 100;

            snowflake.style.width = size + 'px';
            snowflake.style.height = size + 'px';
            snowflake.style.left = left + '%';
            snowflake.style.animationDuration = duration + 's';
            snowflake.style.animationDelay = delay + 's';
            snowflake.style.animationName = 'snowfall, sway';
            snowflake.style.filter = `blur(${Math.random() * 0.5}px)`;

            this.container.appendChild(snowflake);
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('snowfallEnabled', this.isEnabled);
        this.container.classList.toggle('snowfall-disabled');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel if it exists
    const carouselElement = document.querySelector('.festive-carousel');
    if (carouselElement) {
        new FestiveCarousel();
    }

    // Initialize snowfall
    new Snowfall();

    // Add festive animations to other elements
    animateFestiveElements();
});

// Add animations to festive elements
function animateFestiveElements() {
    const festiveElements = document.querySelectorAll('.festive-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out';
                observer.unobserve(entry.target);
            }
        });
    });

    festiveElements.forEach(el => observer.observe(el));
}

// Responsive snowfall count based on window resize
window.addEventListener('resize', () => {
    const snowfallContainer = document.querySelector('.snowfall-container');
    if (snowfallContainer) {
        // Could implement dynamic snowflake adjustment here if needed
    }
});
