// ========== E-STORE - GLOBAL SCRIPT (Supabase Version) ==========
// Pattern: Frontend → Supabase Client → PostgreSQL Database

// ========== SUPABASE CLIENT SETUP ==========
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ========== NAVBAR ==========
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        const scrollY = window.scrollY;
        const heroHeight = hero ? hero.offsetHeight : 100;
        
        if (scrollY > heroHeight - 100) {
            navbar.classList.remove('transparent');
            navbar.classList.add('sticky');
        } else {
            if (document.querySelector('.page-header')) {
                navbar.classList.remove('transparent');
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
                navbar.classList.add('transparent');
            }
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const backdrop = document.querySelector('.mobile-menu-backdrop');

    if (hamburger && mobileMenu) {
        function toggleMenu() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            if (backdrop) backdrop.classList.toggle('show');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        }

        hamburger.addEventListener('click', toggleMenu);
        if (backdrop) backdrop.addEventListener('click', toggleMenu);

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // Set active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ========== SCROLL REVEAL ==========
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
}

// ========== LOAD FEATURED PRODUCTS ==========
async function loadFeaturedProducts(containerId = 'featuredProducts') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Products loading...</p></div>`;

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('isfeatured', true);

        if (error) throw error;
        
        if (!products || products.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No featured products available.</p></div>';
            return;
        }

        window.allProducts = products;

        container.innerHTML = products.map(product => `
            <div class="product-card reveal">
                <div class="card-image-container">
                    <img src="${product.image || 'https://via.placeholder.com/300x200'}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">PKR ${Number(product.price).toLocaleString()}</p>
                    <button class="btn btn-primary btn-small" onclick="addToCartFromId(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Re-init scroll reveal for new elements
        initScrollReveal();
    } catch (error) {
        console.error('Failed to load products:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p>Unable to load products. Showing sample products.</p>
            </div>
            <div class="grid-4">
                ${getStaticProducts().map(p => `
                    <div class="product-card">
                        <div class="card-image-container">
                            <img src="${p.image}" alt="${p.name}" class="product-image">
                        </div>
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            <p class="price">PKR ${p.price.toLocaleString()}</p>
                            <button class="btn btn-primary btn-small" onclick="addToCartFromId(${p.id})">Add to Cart</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ========== STATIC PRODUCT FALLBACK ==========
function getStaticProducts() {
    return [
        { id: 1, name: 'Wireless Mouse', price: 1200, stock: 25, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/d1gb7gicmr8iau.cloudfront.net/495c9afedb2d75dbdf2593e0258a8b0c6999babc.png', isFeatured: true },
        { id: 2, name: 'USB-C Cable', price: 500, stock: 60, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/media.startech.com/73fe27e5c5650031fdd8deafb8a44e0013d06770.jpg', isFeatured: true },
        { id: 3, name: 'LED Monitor 24 inch', price: 22000, stock: 10, category: 'Monitors', image: 'https://kimi-web-img.kimi.ai/img/evmzone.com/b9aff6315a20365d9122a474515a9125472a38a8.jpg', isFeatured: true },
        { id: 4, name: 'Bluetooth Speaker', price: 3500, stock: 40, category: 'Audio', image: 'https://kimi-web-img.kimi.ai/img/cdn.thewirecutter.com/080dcb6c0c16e2b5e607648ce5bf3207e272e7d3.jpg', isFeatured: true },
        { id: 5, name: 'Laptop Stand', price: 2500, stock: 30, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/m.media-amazon.com/8bed9508a08a8d838c136c416f9045b69889d41e.jpg', isFeatured: true },
        { id: 6, name: 'HDMI Cable', price: 800, stock: 100, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/assets.aten.com/5610ab62b42fc988b39286da1f79d954a0cbe947.jpg', isFeatured: true },
        { id: 7, name: 'Mechanical Keyboard', price: 4500, stock: 20, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/resource.logitechg.com/ea80d73828311868a607414691db30c4f81679ff.png', isFeatured: true },
        { id: 8, name: 'Webcam HD', price: 3000, stock: 15, category: 'Cameras', image: 'https://kimi-web-img.kimi.ai/img/prod-cdn.prod.asbis.io/1cf807f0702eee089a09e068f43b3b6c04c66e8f.webp', isFeatured: true }
    ];
}

// ========== LOAD REVIEWS ==========
async function loadReviews(containerId = 'reviewsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading reviews...</p></div>`;

    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('isfeatured', true)
            .order('order', { ascending: true });

        if (error) throw error;
        
        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No reviews yet.</p></div>';
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review-card reveal">
                <div class="quote-icon">"</div>
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p>${review.text}</p>
                <div class="reviewer-name">${review.customername}</div>
                <div class="reviewer-title">${review.customertitle || ''}</div>
            </div>
        `).join('');

        initScrollReveal();
    } catch (error) {
        console.error('Failed to load reviews:', error);
        container.innerHTML = `
            <div class="review-card">
                <div class="quote-icon">"</div>
                <div class="review-stars">★★★★★</div>
                <p>I have experienced the most trustable website. I ordered a laptop from this website and it's been 5 years — the build quality is amazing. The 24/7 service of this website is the best.</p>
                <div class="reviewer-name">Rizwan Baloch</div>
                <div class="reviewer-title">Verified Buyer — Laptop Customer</div>
            </div>
            <div class="review-card">
                <div class="quote-icon">"</div>
                <div class="review-stars">★★★★★</div>
                <p>Most of my friends are using this website and they randomly talk about this website's features, services. So one day I tried this website on behalf of my friends and I really enjoyed it. Now I recommend it to my family as well.</p>
                <div class="reviewer-name">Zuhair Ahmed</div>
                <div class="reviewer-title">Verified Buyer — Regular Customer</div>
            </div>
        `;
    }
}

// ========== LOAD BLOGS ==========
async function loadBlogs(containerId = 'blogsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading blogs...</p></div>`;

    try {
        const { data: blogs, error } = await supabase
            .from('blogs')
            .select('*')
            .limit(10);

        if (error) throw error;
        
        if (!blogs || blogs.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No blog posts available yet.</p></div>';
            return;
        }

        container.innerHTML = blogs.map(blog => `
            <div class="blog-card reveal">
                <div class="blog-image-wrapper">
                    <img src="${blog.coverimage || 'https://via.placeholder.com/800x450'}" 
                         alt="${blog.title}" 
                         class="blog-image"
                         loading="lazy">
                    <span class="category-tag">${blog.category}</span>
                </div>
                <div class="blog-content">
                    <h3>${blog.title}</h3>
                    <p>${blog.excerpt}</p>
                    <div class="blog-meta">
                        <span>${blog.publishedat || 'August 2026'}</span>
                        <span>${blog.readtime || '5 min read'}</span>
                    </div>
                    <a href="#" class="read-more" onclick="event.preventDefault(); showBlogDetail(${blog.id})">Read More →</a>
                </div>
            </div>
        `).join('');

        initScrollReveal();
    } catch (error) {
        console.error('Failed to load blogs:', error);
        loadStaticBlogs(container);
    }
}

function loadStaticBlogs(container) {
    const blogs = [
        {
            id: 1,
            title: 'Why Online Shopping Has Become Part of Everyday Life',
            excerpt: 'A few years ago, online shopping was something people mostly used when they couldn\'t find a product nearby. Today, things have changed...',
            category: 'Shopping Trends',
            coverImage: 'https://via.placeholder.com/800x450?text=Online+Shopping',
            publishedAt: 'August 2026',
            readTime: '5 min read',
            content: 'A few years ago, online shopping was something people mostly used when they couldn\'t find a product nearby. Today, things have changed. People now order clothes, groceries, accessories, toys, and many other everyday items online because it saves time and makes shopping more convenient.'
        },
        {
            id: 2,
            title: 'How E Store Is Making Shopping Simple for Everyone',
            excerpt: 'Shopping should not feel like a difficult task. Sometimes you only need one or two things, but finding them can take much longer than expected...',
            category: 'Company Updates',
            coverImage: 'https://via.placeholder.com/800x450?text=E+Store+Simple+Shopping',
            publishedAt: 'August 2026',
            readTime: '5 min read',
            content: 'Shopping should not feel like a difficult task. Sometimes you only need one or two things, but finding them can take much longer than expected. That\'s one of the reasons we created E Store — to bring different products together and make the shopping process easier.'
        }
    ];

    container.innerHTML = blogs.map(blog => `
        <div class="blog-card reveal">
            <div class="blog-image-wrapper">
                <img src="${blog.coverImage}" alt="${blog.title}" class="blog-image" loading="lazy">
                <span class="category-tag">${blog.category}</span>
            </div>
            <div class="blog-content">
                <h3>${blog.title}</h3>
                <p>${blog.excerpt}</p>
                <div class="blog-meta">
                    <span>${blog.publishedAt}</span>
                    <span>${blog.readTime}</span>
                </div>
                <a href="#" class="read-more" onclick="event.preventDefault(); showBlogDetail(${blog.id})">Read More →</a>
            </div>
        </div>
    `).join('');
    
    initScrollReveal();
}

// ========== BLOG DETAIL MODAL ==========
function showBlogDetail(blogId) {
    const blogs = [
        {
            id: 1,
            title: 'Why Online Shopping Has Become Part of Everyday Life',
            content: 'A few years ago, online shopping was something people mostly used when they couldn\'t find a product nearby. Today, things have changed. People now order clothes, groceries, accessories, toys, and many other everyday items online because it saves time and makes shopping more convenient.\n\nAt E Store, we understand that people don\'t always have the time to visit different shops looking for what they need. Having different types of products in one place makes things a little easier. Customers can look through products, compare their options, place an order, and continue with their day.\n\nAnother reason people prefer online shopping is convenience. You can shop from home, at work, or even while relaxing at night. There is no need to deal with traffic or spend hours walking around different stores.\n\nOf course, online shopping is not only about convenience. Customers also want a store they can trust. Clear product information, reasonable prices, reliable delivery, and helpful customer support all make a difference.\n\nOur goal at E Store is to make everyday shopping feel simple rather than complicated. As online shopping continues to become a normal part of people\'s lives, we want to provide a place where customers can find useful products without making the experience unnecessarily difficult.',
            category: 'Shopping Trends',
            coverImage: 'https://via.placeholder.com/800x450?text=Online+Shopping',
            publishedAt: 'August 2026',
            readTime: '5 min read'
        },
        {
            id: 2,
            title: 'How E Store Is Making Shopping Simple for Everyone',
            content: 'Shopping should not feel like a difficult task. Sometimes you only need one or two things, but finding them can take much longer than expected. That\'s one of the reasons we created E Store — to bring different products together and make the shopping process easier.\n\nE Store offers a variety of products for different needs, whether you\'re looking for something for yourself, your family, or even a gift for someone. Instead of visiting several different stores, customers can browse through different categories from one place.\n\nWe also know that a good shopping experience doesn\'t end when someone clicks the order button. Customers want to know when their order will arrive, have convenient payment options, and get help if something goes wrong. That\'s why we focus on making these parts of the experience as straightforward as possible.\n\nFor us, E Store is more than just an online place to buy products. We want it to become a store that people can return to whenever they need something. We\'re still growing and improving, and customer feedback plays an important part in that process.\n\nAt the end of the day, our aim is pretty simple: offer useful products, treat customers fairly, and make online shopping a little easier for everyone.',
            category: 'Company Updates',
            coverImage: 'https://via.placeholder.com/800x450?text=E+Store+Simple+Shopping',
            publishedAt: 'August 2026',
            readTime: '5 min read'
        }
    ];

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
    modal.innerHTML = `
        <div style="background:white;border-radius:12px;max-width:700px;width:100%;max-height:80vh;overflow-y:auto;padding:32px;position:relative;">
            <button onclick="this.closest('.modal').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#64748B;">✕</button>
            <img src="${blog.coverImage}" alt="${blog.title}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px;">
            <span style="background:#EFF6FF;color:#2563EB;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;">${blog.category}</span>
            <h2 style="margin:12px 0;color:#0F172A;">${blog.title}</h2>
            <div style="color:#64748B;font-size:13px;margin-bottom:16px;">${blog.publishedAt} · ${blog.readTime}</div>
            <div style="color:#1E293B;line-height:1.8;white-space:pre-line;">${blog.content}</div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ========== CONTACT FORM ==========
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const successMsg = document.querySelector('.success-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous errors
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

        // Client-side validation
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value.trim();

        let hasError = false;
        if (fullName.length < 2) {
            document.getElementById('fullName').closest('.form-group').classList.add('error');
            hasError = true;
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            document.getElementById('email').closest('.form-group').classList.add('error');
            hasError = true;
        }
        if (message.length < 10) {
            document.getElementById('message').closest('.form-group').classList.add('error');
            hasError = true;
        }
        if (hasError) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([{ fullname: fullName, email, phone, subject, message }]);

            if (error) throw error;
            
            if (successMsg) {
                successMsg.textContent = 'Thank you! We will get back to you within 24 hours.';
                successMsg.style.display = 'block';
            }
            form.reset();
            showToast('Message sent successfully!', 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== NEWSLETTER FORM ==========
function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            const submitBtn = form.querySelector('button');
            
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;

            try {
                // Check if already subscribed
                const { data: existing, error: checkError } = await supabase
                    .from('subscribers')
                    .select('email')
                    .eq('email', email);

                if (checkError) throw checkError;

                if (existing && existing.length > 0) {
                    showToast('You are already subscribed!', 'info');
                } else {
                    const { error } = await supabase
                        .from('subscribers')
                        .insert([{ email }]);

                    if (error) throw error;
                    showToast('Successfully subscribed to our newsletter!', 'success');
                    emailInput.value = '';
                }
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
}

// ========== ADD TO CART (works with cart.js) ==========
function addToCartFromId(productId) {
    const allProducts = window.allProducts || getStaticProducts();
    const product = allProducts.find(p => String(p.id) === String(productId));
    if (product) {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
    }
}

// ========== INVENTORY DASHBOARD ==========
let inventoryProducts = [];
let currentSearchTerm = '';

// Check if user is authenticated (for write operations)
async function requireAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Static fallback products (used if the live backend is unreachable)
function getInventoryStaticProducts() {
    return [
        { id: 1, name: 'Wireless Mouse', price: 1200, stock: 25, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/d1gb7gicmr8iau.cloudfront.net/495c9afedb2d75dbdf2593e0258a8b0c6999babc.png' },
        { id: 2, name: 'USB-C Cable', price: 500, stock: 60, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/media.startech.com/73fe27e5c5650031fdd8deafb8a44e0013d06770.jpg' },
        { id: 3, name: 'LED Monitor 24 inch', price: 22000, stock: 10, category: 'Monitors', image: 'https://kimi-web-img.kimi.ai/img/evmzone.com/b9aff6315a20365d9122a474515a9125472a38a8.jpg' },
        { id: 4, name: 'Bluetooth Speaker', price: 3500, stock: 40, category: 'Audio', image: 'https://kimi-web-img.kimi.ai/img/cdn.thewirecutter.com/080dcb6c0c16e2b5e607648ce5bf3207e272e7d3.jpg' },
        { id: 5, name: 'Laptop Stand', price: 2500, stock: 30, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/m.media-amazon.com/8bed9508a08a8d838c136c416f9045b69889d41e.jpg' },
        { id: 6, name: 'HDMI Cable', price: 800, stock: 100, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/assets.aten.com/5610ab62b42fc988b39286da1f79d954a0cbe947.jpg' },
        { id: 7, name: 'Mechanical Keyboard', price: 4500, stock: 20, category: 'Accessories', image: 'https://kimi-web-img.kimi.ai/img/resource.logitechg.com/ea80d73828311868a607414691db30c4f81679ff.png' },
        { id: 8, name: 'Webcam HD', price: 3000, stock: 15, category: 'Cameras', image: 'https://kimi-web-img.kimi.ai/img/prod-cdn.prod.asbis.io/1cf807f0702eee089a09e068f43b3b6c04c66e8f.webp' }
    ];
}

// Show warning banner (keeps static data visible)
function renderInventoryError(message) {
    const toolbar = document.querySelector('.inventory-toolbar');
    if (!toolbar) return;
    // Remove any existing warning banner
    const existing = document.querySelector('.inventory-warning');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.className = 'inventory-warning';
    banner.style.cssText = 'background: #FEF3C7; color: #92400E; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;';
    banner.innerHTML = `
        <span>⚠️ ${message}</span>
        <button class="btn btn-small" style="background: #92400E; color: white;" onclick="loadInventory()">Retry</button>
    `;
    toolbar.after(banner);
}

// Load and render inventory
async function loadInventory() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="loading-state">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </td>
        </tr>
    `;

    try {
        let query = supabase.from('products').select('*');
        
        if (currentSearchTerm) {
            query = query.ilike('name', `%${currentSearchTerm}%`);
        }

        const { data, error } = await query.order('id', { ascending: true });
        if (error) throw error;
        
        inventoryProducts = data || [];
        renderInventoryTable();
        updateInventoryStats();
    } catch (error) {
        console.error('Failed to load inventory:', error);
        // Fall back to static products so the dashboard always shows content
        inventoryProducts = getInventoryStaticProducts();
        renderInventoryTable();
        updateInventoryStats();
        renderInventoryError('Showing sample data. Supabase connection failed. Check your config.')
    }
}

// Render products table
function renderInventoryTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (inventoryProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <p>No products found${currentSearchTerm ? ` for "${currentSearchTerm}"` : ''}.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = inventoryProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.image || 'https://via.placeholder.com/60x60?text=Product'}" 
                     alt="${product.name}" 
                     class="inventory-product-image"
                     loading="lazy">
            </td>
            <td class="product-name">${product.name}</td>
            <td><span class="category-badge">${product.category || 'General'}</span></td>
            <td class="price-cell">PKR ${Number(product.price).toLocaleString()}</td>
            <td class="stock-cell ${product.stock <= 10 ? 'stock-low' : 'stock-ok'}">${product.stock}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update stats cards
function updateInventoryStats() {
    const totalProducts = inventoryProducts.length;
    const categories = new Set(inventoryProducts.map(p => p.category || 'General')).size;
    const totalStock = inventoryProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalValue = inventoryProducts.reduce((sum, p) => sum + (Number(p.price) * (Number(p.stock) || 0)), 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalCategories').textContent = categories;
    document.getElementById('totalStock').textContent = totalStock;
    document.getElementById('totalValue').textContent = `PKR ${totalValue.toLocaleString()}`;
}

// Search products
function searchProducts() {
    const input = document.getElementById('searchInput');
    currentSearchTerm = input.value.trim();
    loadInventory();
}

// Reset search
function resetSearch() {
    document.getElementById('searchInput').value = '';
    currentSearchTerm = '';
    loadInventory();
}

// Open Add/Edit modal
function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const backdrop = document.getElementById('productModalBackdrop');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    form.reset();
    document.getElementById('productId').value = '';

    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productFeatured').checked = !!product.isfeatured;
    } else {
        title.textContent = 'Add Product';
    }

    modal.classList.add('show');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('productModalBackdrop').classList.remove('show');
    document.body.style.overflow = '';
}

// Edit product
function editProduct(id) {
    const product = inventoryProducts.find(p => p.id === id);
    if (product) openProductModal(product);
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (!await requireAuth()) return;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        showToast('Product deleted successfully!', 'success');
        loadInventory();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Save product (create or update)
async function saveProduct(event) {
    event.preventDefault();
    if (!await requireAuth()) return;

    const id = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        image: document.getElementById('productImage').value.trim() || 'https://via.placeholder.com/300x200?text=Product',
        description: document.getElementById('productDescription').value.trim(),
        isfeatured: document.getElementById('productFeatured').checked
    };

    const saveBtn = document.getElementById('saveProductBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        if (id) {
            // UPDATE
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id);

            if (error) throw error;
            showToast('Product updated successfully!', 'success');
        } else {
            // INSERT
            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) throw error;
            showToast('Product added successfully!', 'success');
        }

        closeProductModal();
        loadInventory();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// ========== INIT ALL ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollReveal();
    initContactForm();
    initNewsletterForms();
    
    // Load dynamic content
    loadFeaturedProducts();
    loadReviews();
    loadBlogs();

    // Load inventory dashboard if on inventory page
    if (document.getElementById('productsTableBody')) {
        // Redirect to login if not authenticated
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                window.location.href = '/login';
                return;
            }
            loadInventory();
        });
    }

    // Trigger navbar state on page load
    window.dispatchEvent(new Event('scroll'));
});