const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ========== SUPABASE CLIENT ==========
// Uses environment variables if set, otherwise falls back to the project's
// real Supabase URL + anon key (from Supabase Dashboard → Settings → API)
const supabaseUrl = process.env.SUPABASE_URL || 'https://hahefxqodceuvjsyrvlf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_MUcfxxhXbX2vR64yN_hkbQ_kRSaF_0c';
const supabase = createClient(supabaseUrl, supabaseKey);

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json());

// Root route — serve the inventory dashboard entry (before static so it takes priority)
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'inventory.html'));
});
app.get('/inventory', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'inventory.html'));
});

// Serve static frontend files (so Render can host the full site)
app.use(express.static(FRONTEND_DIR));

// ========== PRODUCTS API ==========
// GET /api/products - Get all products (with optional featured filter)
app.get('/api/products', async (req, res) => {
    const { featured, search, category } = req.query;
    let query = supabase.from('products').select('*');

    if (featured === 'true') query = query.eq('isfeatured', true);
    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET /api/products/featured - Get featured products
app.get('/api/products/featured', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('isfeatured', true)
        .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET /api/products/:slug - Get single product
app.get('/api/products/:slug', async (req, res) => {
    const slug = req.params.slug;
    const isNumeric = /^\d+$/.test(slug);

    let query = supabase.from('products').select('*');
    if (isNumeric) {
        query = query.eq('id', parseInt(slug));
    } else {
        query = query.eq('name', slug.replace(/-/g, ' '));
    }

    const { data, error } = await query.single();
    if (error) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
});

// POST /api/products - Create a new product
app.post('/api/products', async (req, res) => {
    const newProduct = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock || 0,
        category: req.body.category || 'General',
        image: req.body.image || 'https://via.placeholder.com/300x200?text=Product',
        isfeatured: req.body.isfeatured || false,
        rating: req.body.rating || 0,
        description: req.body.description || ''
    };

    const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .update(req.body)
        .eq('id', parseInt(req.params.id))
        .select()
        .single();

    if (error) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', parseInt(req.params.id));

    if (error) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
});

// ========== REVIEWS API ==========
app.get('/api/reviews', async (req, res) => {
    const { featured } = req.query;
    let query = supabase.from('reviews').select('*');

    if (featured === 'true') query = query.eq('isfeatured', true);

    const { data, error } = await query.order('order', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ========== BLOGS API ==========
app.get('/api/blogs', async (req, res) => {
    const { category, limit } = req.query;
    let query = supabase.from('blogs').select('*');

    if (category) query = query.eq('category', category);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query.order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.get('/api/blogs/:slug', async (req, res) => {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', req.params.slug)
        .single();

    if (error) return res.status(404).json({ error: 'Blog not found' });
    res.json(data);
});

// ========== CONTACT FORM API ==========
app.post('/api/contact', async (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !subject || !message) {
        return res.status(400).json({ error: 'Required fields: fullName, email, subject, message' });
    }
    if (fullName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
    if (message.length < 10) return res.status(400).json({ error: 'Message must be at least 10 characters' });

    const { error } = await supabase
        .from('contact_messages')
        .insert([{ fullname: fullName, email, phone, subject, message }]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Thank you! We will get back to you within 24 hours.' });
});

// ========== NEWSLETTER SUBSCRIPTION API ==========
app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Check if already subscribed
    const { data: existing, error: checkError } = await supabase
        .from('subscribers')
        .select('email')
        .eq('email', email);

    if (checkError) return res.status(500).json({ error: checkError.message });

    if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'You are already subscribed!' });
    }

    const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

    if (error) return res.status(500).json({ error: error.message });
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

// ========== START SERVER (Koyeb / Render / Local) ==========
const PORT = process.env.PORT || 3000;

// Only listen when run directly (not when imported by Vercel serverless)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`E-Store API server running on port ${PORT}`);
    });
}

// ========== EXPORT FOR VERCEL SERVERLESS ==========
module.exports = app;