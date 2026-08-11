// ========== E-STORE CART SYSTEM (localStorage + Drawer + Toast) ==========
const CART_STORAGE_KEY = 'e-store-cart';

// ========== CART STATE ==========
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    renderCartDrawer();
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => String(item.id) === String(product.id));
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image || 'https://via.placeholder.com/300x200',
            quantity: 1
        });
    }
    saveCart(cart);
    showCartToast('Added to cart successfully!');
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => String(item.id) !== String(productId));
    saveCart(cart);
}

function updateQuantity(productId, delta) {
    const cart = getCart();
    const item = cart.find(i => String(i.id) === String(productId));
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    saveCart(cart);
}

function clearCart() {
    saveCart([]);
}

function getCartTotal() {
    return getCart().reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
}

function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

// ========== TOAST (2s auto-hide, green) ==========
function showCartToast(message, type) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    if (type === 'error') {
        toast.className = 'toast toast-error';
    } else {
        toast.className = 'toast toast-success';
    }
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ========== NAVBAR CART BUTTON (auto-injected) ==========
function injectCartButton() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight || document.querySelector('.cart-btn')) return;

    const cartBtn = document.createElement('button');
    cartBtn.className = 'cart-btn';
    cartBtn.setAttribute('aria-label', 'Open cart');
    cartBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="cart-badge" id="cartBadge">0</span>
    `;
    cartBtn.addEventListener('click', openCartDrawer);
    navRight.insertBefore(cartBtn, navRight.firstChild);
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

// ========== CART DRAWER ==========
function injectCartDrawer() {
    if (document.getElementById('cartDrawer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
        <div class="cart-drawer-header">
            <h3>Your Cart</h3>
            <button class="cart-drawer-close" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-drawer-items" id="cartDrawerItems"></div>
        <div class="cart-drawer-footer">
            <div class="cart-drawer-total">
                <span>Total</span>
                <span id="cartDrawerTotal">PKR 0</span>
            </div>
            <a href="checkout.html" class="btn btn-primary cart-checkout-btn">Proceed to Checkout</a>
        </div>
    `;
    document.body.appendChild(drawer);

    const backdrop = document.createElement('div');
    backdrop.className = 'cart-backdrop';
    backdrop.id = 'cartBackdrop';
    document.body.appendChild(backdrop);

    drawer.querySelector('.cart-drawer-close').addEventListener('click', closeCartDrawer);
    backdrop.addEventListener('click', closeCartDrawer);
}

function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (!drawer) return;
    renderCartDrawer();
    drawer.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
}

function renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    const totalEl = document.getElementById('cartDrawerTotal');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        if (totalEl) totalEl.textContent = 'PKR 0';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">PKR ${Number(item.price).toLocaleString()}</div>
                <div class="cart-item-controls">
                    <button class="cart-qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    if (totalEl) totalEl.textContent = `PKR ${getCartTotal().toLocaleString()}`;
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    injectCartButton();
    injectCartDrawer();
    updateCartBadge();
});