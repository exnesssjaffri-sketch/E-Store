// ========== E-STORE CHECKOUT (Supabase Orders) ==========
console.log('checkout.js loaded');

const DELIVERY_FEE = 200;
const ORDERS_STORAGE_KEY = 'e-store-orders';
const CART_STORAGE_KEY = 'e-store-cart';
let supabase = null;

// Read cart from localStorage (same key used by the cart sidebar)
function getCartData() {
    try {
        // Prefer the cart.js helper if available
        if (typeof getCart === 'function') {
            const cart = getCart();
            if (Array.isArray(cart)) return cart;
        }
        // Fallback: read directly from localStorage
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (e) {
        console.warn('Failed to read cart from localStorage:', e);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Safe supabase init — never crash if Supabase is unavailable
    try {
        if (window.supabase && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.warn('Supabase not available — checkout will work with local cart only.');
        }
    } catch (e) {
        console.warn('Supabase init failed:', e);
    }

    // 2. Get cart (defensive) — reads from localStorage directly
    const cart = getCartData();
    console.log('DOMContentLoaded fired, cart:', cart);
    const layout = document.getElementById('checkoutLayout');
    const emptyState = document.getElementById('checkoutEmpty');

    // 3. Empty cart check
    if (!cart || cart.length === 0) {
        if (layout) layout.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    // 4. Render order summary
    renderOrderSummary();

    // Payment method toggle
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            e.target.closest('.payment-option').classList.add('selected');
            const cardFields = document.getElementById('cardFields');
            if (cardFields) cardFields.classList.toggle('show', e.target.value === 'card');
        });
    });

    // Real-time validation
    initCheckoutValidation();

    // Card formatting
    initCardFormatting();

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', placeOrder);
});

// ========== REAL-TIME VALIDATION ==========
function initCheckoutValidation() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            validateCheckoutField(field);
        });
        field.addEventListener('input', () => {
            if (field.closest('.form-group') && field.closest('.form-group').classList.contains('error')) {
                validateCheckoutField(field);
            }
        });
    });
}

function validateCheckoutField(field) {
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
    } else if (field.id === 'cardNumber' && field.value && field.value.replace(/\s/g, '').length < 16) {
        isValid = false;
        errorMessage = 'Card number must be 16 digits';
    } else if (field.id === 'cardExpiry' && field.value && !/^\d{2}\/\d{2}$/.test(field.value)) {
        isValid = false;
        errorMessage = 'Use MM/YY format';
    } else if (field.id === 'cardCvv' && field.value && field.value.length < 3) {
        isValid = false;
        errorMessage = 'CVV must be 3-4 digits';
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

function renderOrderSummary() {
    const cart = getCartData();
    const itemsContainer = document.getElementById('orderSummaryItems');

    // === MANUAL SUBTOTAL CALCULATION (bulletproof) ===
    const subtotal = cart.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        return sum + (price * qty);
    }, 0);

    const deliveryFee = DELIVERY_FEE;
    const grandTotal = subtotal + deliveryFee;

    // === UPDATE DOM ELEMENTS BY ID ===
    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryEl = document.getElementById('summaryDeliveryFee');
    const grandTotalEl = document.getElementById('summaryGrandTotal');

    if (subtotalEl) subtotalEl.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (deliveryEl) deliveryEl.textContent = `PKR ${deliveryFee.toLocaleString()}`;
    if (grandTotalEl) grandTotalEl.textContent = `PKR ${grandTotal.toLocaleString()}`;

    // === RENDER CART ITEMS LIST ===
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p class="text-gray-500">No items in cart.</p>';
        } else {
            itemsContainer.innerHTML = cart.map(item => `
                <div class="order-summary-item">
                    <span class="os-name">${item.name}</span>
                    <span class="os-qty">× ${item.quantity || 1}</span>
                    <span class="os-price">PKR ${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</span>
                </div>
            `).join('');
        }
    }

    console.log('Checkout rendered:', { subtotal, deliveryFee, grandTotal, cart });
}

function saveOrderLocally(order) {
    try {
        const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
        orders.push(order);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
        console.error('Failed to save order locally:', e);
    }
}

async function placeOrder(e) {
    e.preventDefault();

    const form = document.getElementById('checkoutForm');
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Basic validation
    let hasError = false;
    ['fullName', 'phone', 'email', 'address'].forEach(id => {
        const field = document.getElementById(id);
        if (field && !validateCheckoutField(field)) {
            hasError = true;
        }
    });

    if (hasError) {
        showCartToast('Please fill in all required fields correctly.', 'error');
        return;
    }

    // Card validation if card selected
    if (paymentMethod === 'card') {
        ['cardNumber', 'cardExpiry', 'cardCvv'].forEach(id => {
            const field = document.getElementById(id);
            if (field && !validateCheckoutField(field)) {
                hasError = true;
            }
        });
        if (hasError) {
            showCartToast('Please fill in all card details correctly.', 'error');
            return;
        }
    }

    const cart = getCartData();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const totalAmount = subtotal + DELIVERY_FEE;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;

    try {
        const orderData = {
            full_name: fullName,
            phone: phone,
            email: email,
            address: address,
            payment_method: paymentMethod,
            items: cart,
            total_amount: totalAmount,
            status: 'pending'
        };

        if (supabase) {
            const { error } = await supabase
                .from('orders')
                .insert([orderData]);

            if (error) throw error;
        } else {
            // Fallback: save order locally if Supabase is unavailable
            console.warn('Supabase unavailable — saving order locally');
            saveOrderLocally({
                ...orderData,
                created_at: new Date().toISOString()
            });
        }

        if (typeof clearCart === 'function') clearCart();
        form.reset();
        const layout = document.getElementById('checkoutLayout');
        const emptyState = document.getElementById('checkoutEmpty');
        if (layout) layout.style.display = 'none';
        if (emptyState) {
            emptyState.innerHTML = `
                <h3>Order Placed Successfully! 🎉</h3>
                <p>Thank you, ${fullName}. Your order has been received and will be processed soon.</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            `;
            emptyState.style.display = 'block';
        }
        showCartToast('Order Placed Successfully!');
    } catch (error) {
        console.error('Order failed:', error);
        showCartToast('Error placing order: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}