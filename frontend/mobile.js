// ============================================================
// E-STORE MOBILE INTERACTIONS & ACCESSIBILITY
// ============================================================
// Provides touch-optimized interactions, screen reader
// announcements, focus management, and full feature parity
// across all screen sizes.
// ============================================================

// ========== SCREEN READER ANNOUNCEMENTS ==========
function announce(message) {
    let region = document.getElementById('ariaLiveRegion');
    if (!region) {
        region = document.createElement('div');
        region.id = 'ariaLiveRegion';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        document.body.appendChild(region);
    }
    region.textContent = '';
    setTimeout(() => {
        region.textContent = message;
    }, 50);
}

// ========== SKIP LINK ==========
function initSkipLink() {
    if (document.querySelector('.skip-link')) return;
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ========== TOUCH-OPTIMIZED DROPDOWNS ==========
// All hover dropdowns get tap-to-open behavior on touch devices
function initTouchDropdowns() {
    document.querySelectorAll('.dropdown, .user-menu, .language-toggle').forEach(container => {
        const trigger = container.querySelector('.dropdown-trigger, .user-menu-btn, .language-toggle');
        const content = container.querySelector('.dropdown-content, .user-dropdown, .language-dropdown');
        if (!trigger || !content) return;

        // Tap to open/close
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = content.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) {
                content.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
                announce('Menu opened');
            }
        });

        // Close on outside tap
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                content.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                content.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
                trigger.focus();
            }
        });
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content, .user-dropdown, .language-dropdown').forEach(d => {
        d.classList.remove('open');
    });
    document.querySelectorAll('[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
    });
}

// ========== TOOLTIPS - TOUCH EQUIVALENT ==========
function initTouchTooltips() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const wasTapped = tooltip.classList.contains('tapped');
            document.querySelectorAll('.tooltip.tapped').forEach(t => t.classList.remove('tapped'));
            if (!wasTapped) {
                tooltip.classList.add('tapped');
            }
        });
    });

    // Close tooltips on outside tap
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tooltip')) {
            document.querySelectorAll('.tooltip.tapped').forEach(t => t.classList.remove('tapped'));
        }
    });
}

// ========== LIGHTBOX / IMAGE GALLERY ==========
let lightboxImages = [];
let lightboxIndex = 0;

function initLightbox() {
    // Create lightbox container
    if (document.getElementById('globalLightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.id = 'globalLightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image viewer');
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close image viewer">&times;</button>
        <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
        <button class="lightbox-next" aria-label="Next image">&#10095;</button>
        <img src="" alt="Enlarged image">
    `;
    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const img = lightbox.querySelector('img');

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigateLightbox(-1));
    nextBtn.addEventListener('click', () => navigateLightbox(1));

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
            closeLightbox();
        }
        if (e.key === 'ArrowLeft' && lightbox.classList.contains('open')) {
            navigateLightbox(-1);
        }
        if (e.key === 'ArrowRight' && lightbox.classList.contains('open')) {
            navigateLightbox(1);
        }
    });

    // Swipe support
    let startX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) navigateLightbox(-1);
            else navigateLightbox(1);
        }
    }, { passive: true });

    // Make all product images clickable
    document.querySelectorAll('.product-image, .blog-image, .about-image img, .journey-image').forEach(imgEl => {
        imgEl.style.cursor = 'zoom-in';
        imgEl.addEventListener('click', () => {
            const allImages = Array.from(document.querySelectorAll('.product-image, .blog-image, .about-image img, .journey-image'));
            lightboxImages = allImages.map(i => i.src);
            lightboxIndex = allImages.indexOf(imgEl);
            openLightbox();
        });
    });
}

function openLightbox() {
    const lightbox = document.getElementById('globalLightbox');
    if (!lightbox || lightboxImages.length === 0) return;
    const img = lightbox.querySelector('img');
    img.src = lightboxImages[lightboxIndex];
    img.alt = 'Enlarged image ' + (lightboxIndex + 1) + ' of ' + lightboxImages.length;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
    announce('Image viewer opened');
}

function closeLightbox() {
    const lightbox = document.getElementById('globalLightbox');
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    announce('Image viewer closed');
}

function navigateLightbox(direction) {
    if (lightboxImages.length === 0) return;
    lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    const lightbox = document.getElementById('globalLightbox');
    const img = lightbox.querySelector('img');
    img.src = lightboxImages[lightboxIndex];
    announce('Image ' + (lightboxIndex + 1) + ' of ' + lightboxImages.length);
}

// ========== CAROUSEL / SLIDER ==========
function initCarousels() {
    document.querySelectorAll('.carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        if (!track) return;

        const slides = Array.from(track.children);
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let currentIndex = 0;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        // Create dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            });
        }

        // Create arrows
        if (!carousel.querySelector('.carousel-arrow.prev')) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'carousel-arrow prev';
            prevBtn.innerHTML = '&#10094;';
            prevBtn.setAttribute('aria-label', 'Previous slide');
            prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
            carousel.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'carousel-arrow next';
            nextBtn.innerHTML = '&#10095;';
            nextBtn.setAttribute('aria-label', 'Next slide');
            nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
            carousel.appendChild(nextBtn);
        }

        function goToSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (dotsContainer) {
                dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
            announce('Slide ' + (currentIndex + 1) + ' of ' + slides.length);
        }

        // Touch/swipe support
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            track.style.transition = 'none';
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const diff = currentX - startX;
            track.style.transition = '';
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToSlide(currentIndex - 1);
                else goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex);
            }
        }, { passive: true });

        // Mouse drag support (desktop)
        track.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            currentX = startX;
            isDragging = true;
            track.style.transition = 'none';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
            const diff = currentX - startX;
            track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            const diff = currentX - startX;
            track.style.transition = '';
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToSlide(currentIndex - 1);
                else goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex);
            }
        });

        // Auto-play (optional, disabled for reduced motion)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setInterval(() => goToSlide(currentIndex + 1), 5000);
        }
    });
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
    // Global search function
    window.searchProducts = function(query) {
        if (!query || query.trim() === '') return;
        const allProducts = window.allProducts || (typeof getStaticProducts === 'function' ? getStaticProducts() : []);
        const results = allProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(query.toLowerCase())
        );
        announce(results.length + ' products found');
        return results;
    };

    // Navbar search (desktop)
    document.querySelectorAll('.navbar-search input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const results = searchProducts(input.value);
                if (results && results.length > 0) {
                    window.location.href = 'products.html?search=' + encodeURIComponent(input.value);
                } else {
                    showToast('No products found for "' + input.value + '"', 'info');
                }
            }
        });
    });

    // Mobile menu search
    document.querySelectorAll('.mobile-menu-search input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const results = searchProducts(input.value);
                if (results && results.length > 0) {
                    window.location.href = 'products.html?search=' + encodeURIComponent(input.value);
                } else {
                    showToast('No products found for "' + input.value + '"', 'info');
                }
            }
        });
    });

    // Products page search from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && document.getElementById('productsGrid')) {
        const results = searchProducts(searchQuery);
        if (results) {
            renderProducts(results);
            const filters = document.getElementById('productFilters');
            if (filters) {
                filters.innerHTML = `<button class="btn btn-small filter-btn active" data-category="All">All</button>
                    <button class="btn btn-small filter-btn" onclick="window.location.href='products.html'">Clear Search</button>`;
            }
        }
    }
}

// ========== LANGUAGE TOGGLE ==========
function initLanguageToggle() {
    document.querySelectorAll('.language-toggle').forEach(toggle => {
        const dropdown = toggle.querySelector('.language-dropdown');
        if (!dropdown) return;

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        dropdown.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                dropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const lang = btn.getAttribute('data-lang');
                localStorage.setItem('e-store-language', lang);
                announce('Language changed to ' + btn.textContent);
                dropdown.classList.remove('open');
            });
        });
    });
}

// ========== CART DRAWER SWIPE-TO-CLOSE ==========
function initCartSwipe() {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;

    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    drawer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
        drawer.style.transition = 'none';
    }, { passive: true });

    drawer.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const diffX = e.touches[0].clientX - startX;
        const diffY = e.touches[0].clientY - startY;
        // Only swipe horizontally
        if (Math.abs(diffX) > Math.abs(diffY) && diffX > 0) {
            drawer.style.transform = `translateX(${diffX}px)`;
        }
    }, { passive: true });

    drawer.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        drawer.style.transition = '';
        const diffX = e.changedTouches[0].clientX - startX;
        if (diffX > 100) {
            closeCartDrawer();
        } else {
            drawer.style.transform = '';
        }
    }, { passive: true });
}

// ========== MOBILE MENU SWIPE ==========
function initMobileMenuSwipe() {
    const menu = document.querySelector('.mobile-menu');
    if (!menu) return;

    let startX = 0;
    let isSwiping = false;

    menu.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
        menu.style.transition = 'none';
    }, { passive: true });

    menu.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const diffX = e.touches[0].clientX - startX;
        if (diffX < 0) {
            menu.style.transform = `translateX(${diffX}px)`;
        }
    }, { passive: true });

    menu.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        menu.style.transition = '';
        const diffX = e.changedTouches[0].clientX - startX;
        if (diffX < -100) {
            const hamburger = document.querySelector('.hamburger');
            if (hamburger) hamburger.click();
        } else {
            menu.style.transform = '';
        }
    }, { passive: true });
}

// ========== FOCUS MANAGEMENT ==========
function initFocusManagement() {
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const modal = document.querySelector('.product-modal.show, .lightbox.open');
        if (!modal) return;

        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // Return focus to trigger element when modal closes
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
            const trigger = document.querySelector('[data-modal-trigger]');
            if (trigger) trigger.focus();
        }
    });
}

// ========== REAL-TIME FORM VALIDATION ==========
function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => {
                validateField(field);
            });
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateField(field);
                }
            });
        });
    });
}

function validateField(field) {
    const group = field.closest('.form-group');
    if (!group) return;

    const errorEl = group.querySelector('.form-error');
    let isValid = true;
    let errorMessage = '';

    if (field.required && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && field.value && !/^\S+@\S+\.\S+$/.test(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.type === 'tel' && field.value && !/^[0-9+\-\s()]{7,15}$/.test(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
    } else if (field.minLength && field.value.length < field.minLength) {
        isValid = false;
        errorMessage = `Must be at least ${field.minLength} characters`;
    }

    group.classList.toggle('error', !isValid);
    if (errorEl) errorEl.textContent = errorMessage;

    return isValid;
}

// ========== CARD FORMATTING ==========
function initCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '').slice(0, 16);
            e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        });
    }

    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
            if (value.length >= 3) {
                e.target.value = value.slice(0, 2) + '/' + value.slice(2);
            } else {
                e.target.value = value;
            }
        });
    }

    const cardCvv = document.getElementById('cardCvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }
}

// ========== LAZY LOADING ==========
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
}

// ========== PASSIVE EVENT LISTENERS ==========
function initPassiveListeners() {
    // Ensure scroll listeners are passive
    const scrollEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
    scrollEvents.forEach(event => {
        document.addEventListener(event, () => {}, { passive: true });
    });
}

// ========== VIRTUALIZED LIST (for long product lists) ==========
function initVirtualizedList() {
    // Simple virtualization for product grids
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const items = grid.querySelectorAll('.product-card');
    if (items.length < 20) return;

    // Only render items near viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.display = '';
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '500px' });

    items.forEach((item, index) => {
        if (index > 12) {
            item.style.display = 'none';
            observer.observe(item);
        }
    });
}

// ========== INIT ALL ==========
document.addEventListener('DOMContentLoaded', () => {
    initSkipLink();
    initTouchDropdowns();
    initTouchTooltips();
    initLightbox();
    initCarousels();
    initSearch();
    initLanguageToggle();
    initCartSwipe();
    initMobileMenuSwipe();
    initFocusManagement();
    initFormValidation();
    initCardFormatting();
    initLazyLoading();
    initPassiveListeners();
    initVirtualizedList();

    // Re-init after dynamic content loads
    setTimeout(() => {
        initLightbox();
        initCarousels();
        initVirtualizedList();
    }, 2000);
});