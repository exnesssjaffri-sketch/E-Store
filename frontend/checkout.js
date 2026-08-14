// ========== E-STORE CHECKOUT (Supabase Orders) ==========
const DELIVERY_FEE = 200;
const ORDERS_STORAGE_KEY = 'e-store-orders';
let supabase = null;

// Initialize Supabase defensively — cart totals are local and must work even if Supabase fails
try {
    if (window.supabase && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase not available — checkout will work with local cart only.');
    }
} catch (e) {
    console.warn('Supabase init failed:', e);
}

document.addEventListener('DOMContentLoaded', () => {
    const layout = document.getElementById('checkoutLayout');
    const emptyState = document.getElementById('checkoutEmpty');
    const cart = getCart();

    // Show empty state if cart is empty
    if (cart.length === 0) {
        layout.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    renderOrderSummary();

    // Payment method toggle
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            e.target.closest('.payment-option').classList.add('selected');
            document.getElementById('cardFields').classList.toggle('show', e.target.value === 'card');
        });
    });

    document.getElementById('checkoutForm').addEventListener('submit', placeOrder);
});

function renderOrderSummary() {
    const cart = getCart();
    const itemsContainer = document.getElementById('orderSummaryItems');

    // Calculate subtotal manually — do not rely only on getCartTotal()
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
    const deliveryFee = DELIVERY_FEE;
    const grandTotal = subtotal + deliveryFee;

    itemsContainer.innerHTML = cart.map(item => `
        <div class="order-summary-item">
            <span class="os-name">${item.name}</span>
            <span class="os-qty">× ${item.quantity}</span>
            <span class="os-price">PKR ${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
        </div>
    `).join('');

    document.getElementById('summarySubtotal').textContent = `PKR ${subtotal.toLocaleString()}`;
    document.getElementById('summaryDeliveryFee').textContent = `PKR ${deliveryFee.toLocaleString()}`;
    document.getElementById('summaryGrandTotal').textContent = `PKR ${grandTotal.toLocaleString()}`;
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

    const cart = getCart();
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

        clearCart();
        form.reset();
        document.getElementById('checkoutLayout').style.display = 'none';
        document.getElementById('checkoutEmpty').innerHTML = `
            <h3>Order Placed Successfully! 🎉</h3>
            <p>Thank you, ${fullName}. Your order has been received and will be processed soon.</p>
            <a href="index.html" class="btn btn-primary">Continue Shopping</a>
        `;
        document.getElementById('checkoutEmpty').style.display = 'block';
        showCartToast('Order Placed Successfully!');
    } catch (error) {
        console.error('Order failed:', error);
        showCartToast('Error placing order: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}