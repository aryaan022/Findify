/* ========================================
   🎬 INTERACTIVE COMPONENTS
   JavaScript for Animations & UX Enhancement
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    });
  }

  // ===== SMOOTH SCROLL LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== TOAST NOTIFICATIONS =====
  window.showToast = function(message, type = 'success', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${getIconClass(type)} me-2"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, duration);
  };

  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      width: 100%;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  }

  function getIconClass(type) {
    const icons = {
      'success': 'fa-check-circle',
      'danger': 'fa-exclamation-circle',
      'warning': 'fa-warning',
      'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
  }

  // ===== LOADING SPINNER =====
  window.showLoading = function(buttonElement) {
    if (buttonElement) {
      buttonElement.classList.add('loading');
      buttonElement.disabled = true;
      const originalText = buttonElement.innerHTML;
      buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
      buttonElement.dataset.originalText = originalText;
    }
  };

  window.hideLoading = function(buttonElement) {
    if (buttonElement) {
      buttonElement.classList.remove('loading');
      buttonElement.disabled = false;
      buttonElement.innerHTML = buttonElement.dataset.originalText || 'Submit';
    }
  };

  // ===== FORM VALIDATION =====
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.value.trim() && input.hasAttribute('required')) {
          input.classList.add('is-invalid');
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
        }
      });

      if (!isValid) {
        e.preventDefault();
        showToast('Please fill out all required fields', 'warning');
      }
    });
  });

  // ===== INPUT FOCUS EFFECTS =====
  document.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('focus', function() {
      this.style.borderColor = 'var(--primary)';
      this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    });

    input.addEventListener('blur', function() {
      this.style.borderColor = '';
      this.style.boxShadow = '';
    });
  });

  // ===== RATING SELECTOR =====
  document.querySelectorAll('.rating-selector .rating-star-input').forEach(star => {
    star.addEventListener('click', function() {
      const rating = this.value;
      document.querySelectorAll('.rating-selector .rating-star-input').forEach(s => {
        if (s.value <= rating) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
      // Set hidden input value
      const hiddenInput = document.querySelector('input[name="rating"]');
      if (hiddenInput) hiddenInput.value = rating;
    });
  });

  // ===== SEARCH ANIMATION =====
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      this.parentElement.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.3)';
      this.parentElement.style.borderColor = 'rgba(102, 126, 234, 0.6)';
    });

    searchInput.addEventListener('blur', function() {
      this.parentElement.style.boxShadow = '';
      this.parentElement.style.borderColor = '';
    });
  }

  // ===== MODAL ANIMATIONS =====
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('show.bs.modal', function() {
      this.style.animation = 'fadeIn 0.3s ease-out';
    });
  });

  // ===== CARD HOVER ANIMATIONS =====
  document.querySelectorAll('.business-card, .card-animated').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-12px)';
      this.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });

  // ===== SCROLL ANIMATIONS =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideUp 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .review-item, .business-card').forEach(el => {
    observer.observe(el);
  });

  // ===== FAVORITE BUTTON =====
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      this.classList.toggle('liked');
      if (this.classList.contains('liked')) {
        this.style.color = 'var(--danger)';
      } else {
        this.style.color = '';
      }
    });
  });

  // ===== MESSAGE BUBBLE ANIMATIONS =====
  document.querySelectorAll('.message-bubble').forEach(bubble => {
    bubble.style.animation = 'slideUp 0.3s ease-out';
  });

  // ===== TYPING INDICATOR =====
  window.showTypingIndicator = function() {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      const typing = document.createElement('div');
      typing.className = 'message-bubble received typing-indicator';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messagesContainer.appendChild(typing);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  window.hideTypingIndicator = function() {
    const typing = document.querySelector('.typing-indicator');
    if (typing) typing.remove();
  };

  // ===== AUTO-CLEAR ALERTS =====
  document.querySelectorAll('.alert').forEach(alert => {
    const closeBtn = alert.querySelector('.btn-close');
    if (closeBtn) {
      setTimeout(() => {
        closeBtn.click();
      }, 5000);
    }
  });

  // ===== RIPPLE EFFECT ON BUTTONS =====
  document.querySelectorAll('button, .btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ===== BREADCRUMB ANIMATION =====
  document.querySelectorAll('.breadcrumb-item').forEach((item, index) => {
    item.style.animation = `slideUp 0.5s ease-out ${index * 0.1}s both`;
  });

  // ===== DARK MODE TOGGLE =====
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
      this.innerHTML = document.body.classList.contains('dark-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    });

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // ===== SEARCH FILTERS =====
  document.querySelectorAll('.filter-item input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      this.parentElement.classList.toggle('selected');
    });
  });

  // ===== PROGRESS BAR ANIMATION =====
  document.querySelectorAll('.progress-bar').forEach(bar => {
    const width = bar.style.width || '0%';
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = 'width 1s ease-out';
      bar.style.width = width;
    }, 100);
  });

  // ===== LAZY LOAD IMAGES =====
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('lazy-loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ===== DEBOUNCE SEARCH =====
  window.debounce = function(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  console.log('✅ Interactive components initialized');
});

// ===== CSS RIPPLE ANIMATION =====
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-animation {
    to {
      opacity: 0;
      transform: scale(4);
    }
  }
  
  .typing-indicator {
    display: flex;
    gap: 4px;
  }
  
  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: typing 1.4s infinite;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0%, 60%, 100% {
      opacity: 0.5;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-10px);
    }
  }

  .lazy-loaded {
    animation: fadeIn 0.5s ease-out;
  }
`;
document.head.appendChild(style);
