// ========== E-STORE CHECKOUT (Supabase Orders) ==========
console.log('checkout.js loaded');

const DELIVERY_FEE = 200;
const ORDERS_STORAGE_KEY = 'e-store-orders';
let supabase = null;

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

    // 2. Get cart (defensive)
    const cart = (typeof getCart === 'function') ? getCart() : [];
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

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', placeOrder);
});

function renderOrderSummary() {
    const cart = (typeof getCart === 'function') ? getCart() : [];
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
    if (!fullName || !phone || !email || !address) {
        showCartToast('Please fill in all required fields.', 'error');
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        showCartToast('Please enter a valid email address.', 'error');
        return;
    }

    // Card validation if card selected
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardExpiry = document.getElementById('cardExpiry').value.trim();
        const cardCvv = document.getElementById('cardCvv').value.trim();
        if (!cardNumber || !cardExpiry || !cardCvv) {
            showCartToast('Please fill in all card details.', 'error');
            return;
        }
    }

    const cart = (typeof getCart === 'function') ? getCart() : [];
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