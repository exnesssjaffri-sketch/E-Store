// ========== E-STORE PRODUCTS PAGE ==========
// Loads every product from getStaticProducts() and renders them in a responsive grid.

document.addEventListener('DOMContentLoaded', () => {
    initProductsPage();
});

function initProductsPage() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const products = getStaticProducts();

    // Build category filter tabs (All + unique categories)
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const filtersContainer = document.getElementById('productFilters');
    if (filtersContainer) {
        filtersContainer.innerHTML = categories.map(cat =>
            `<button class="btn btn-small filter-btn${cat === 'All' ? ' active' : ''}" data-category="${cat}">${cat}</button>`
        ).join('');
    }

    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No products available at the moment.</p></div>';
        return;
    }

    renderProducts(products);

    // Filter tabs
    if (filtersContainer) {
        filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                const filtered = category === 'All'
                    ? products
                    : products.filter(p => p.category === category);
                renderProducts(filtered);
            });
        });
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No products available at the moment.</p></div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const inStock = Number(product.stock) > 0;
        return `
            <div class="product-card">
                <div class="card-image-container">
                    <img src="${product.image || 'https://via.placeholder.com/300x200'}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">PKR ${Number(product.price).toLocaleString()}</p>
                    <p class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
                        ${inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                    ${inStock 
                        ? `<button class="btn btn-primary btn-small" onclick="addProductToCart(${product.id})">Add to Cart</button>`
                        : `<button class="btn btn-primary btn-small" disabled>Add to Cart</button>`}
                </div>
            </div>
        `;
    }).join('');
}

// Add product to cart using the global cart system and show toast
function addProductToCart(productId) {
    const product = getStaticProducts().find(p => String(p.id) === String(productId));
    if (!product) return;
    if (Number(product.stock) <= 0) {
        showCartToast('Out of stock!', 'error');
        return;
    }
    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
    });
    showCartToast('Added to cart!');
}