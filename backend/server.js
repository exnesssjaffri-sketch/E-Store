const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// File paths
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const BLOGS_FILE = path.join(__dirname, 'blogs.json');

app.use(cors());
app.use(express.json());

// ========== HELPER FUNCTIONS ==========
function readJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// ========== IN-MEMORY STORES (Vercel serverless has read-only filesystem) ==========
let products = readJSON(PRODUCTS_FILE);
let reviews = readJSON(REVIEWS_FILE);
let blogs = readJSON(BLOGS_FILE);
let nextProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
let nextContactId = 1;
let contacts = [];
let subscribers = [];

// ========== PRODUCTS API ==========
// GET /api/products - Get all products (with optional featured filter)
app.get('/api/products', (req, res) => {
    const { featured, search, category } = req.query;
    let result = products;
    if (featured === 'true') result = result.filter(p => p.isFeatured);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    res.json(result);
});

// GET /api/products/featured - Get featured products
app.get('/api/products/featured', (req, res) => {
    res.json(products.filter(p => p.isFeatured));
});

// GET /api/products/:slug - Get single product
app.get('/api/products/:slug', (req, res) => {
    const slug = req.params.slug;
    const product = products.find(p => p.id === parseInt(slug) || p.name.toLowerCase().replace(/\s+/g, '-') === slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
    const newProduct = {
        id: nextProductId++,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock || 0,
        category: req.body.category || 'General',
        image: req.body.image || 'https://via.placeholder.com/300x200?text=Product',
        isFeatured: req.body.isFeatured || false,
        rating: req.body.rating || 0,
        description: req.body.description || ''
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products[index] = { ...products[index], ...req.body, id: parseInt(req.params.id) };
    res.json(products[index]);
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', (req, res) => {
    const filtered = products.filter(p => p.id !== parseInt(req.params.id));
    if (filtered.length === products.length) return res.status(404).json({ error: 'Product not found' });
    products = filtered;
    res.json({ message: 'Product deleted successfully' });
});

// ========== REVIEWS API ==========
app.get('/api/reviews', (req, res) => {
    const { featured } = req.query;
    let result = reviews;
    if (featured === 'true') result = result.filter(r => r.isFeatured);
    res.json(result.sort((a, b) => a.order - b.order));
});

// ========== BLOGS API ==========
app.get('/api/blogs', (req, res) => {
    const { category, limit } = req.query;
    let result = blogs;
    if (category) result = result.filter(b => b.category === category);
    if (limit) result = result.slice(0, parseInt(limit));
    res.json(result);
});

app.get('/api/blogs/:slug', (req, res) => {
    const blog = blogs.find(b => b.slug === req.params.slug);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
});

// ========== CONTACT FORM API ==========
app.post('/api/contact', (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !subject || !message) {
        return res.status(400).json({ error: 'Required fields: fullName, email, subject, message' });
    }
    if (fullName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
    if (message.length < 10) return res.status(400).json({ error: 'Message must be at least 10 characters' });
    const newContact = {
        id: nextContactId++,
        fullName, email, phone, subject, message,
        isRead: false,
        createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    res.status(201).json({ message: 'Thank you! We will get back to you within 24 hours.' });
});

// ========== NEWSLETTER SUBSCRIPTION API ==========
app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (subscribers.find(s => s.email === email)) {
        return res.status(409).json({ error: 'You are already subscribed!' });
    }
    subscribers.push({ email, subscribedAt: new Date().toISOString() });
    res.status(201).json({ message: 'Successfully subscribed to our newsletter!' });
});

// ========== SITE SETTINGS API ==========
app.get('/api/settings', (req, res) => {
    res.json({
        storeName: 'E Store',
        contactEmail: 'exnesssjaffri@gmail.com',
        contactPhone: '0333 2561434',
        workingHours: 'Monday — Saturday: 9:00 AM — 8:00 PM'
    });
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== EXPORT FOR VERCEL SERVERLESS ==========
module.exports = app;