-- =============================================
-- E-STORE SUPABASE SETUP SCRIPT
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- ========== 1. CREATE TABLES ==========

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'General',
    image TEXT DEFAULT 'https://via.placeholder.com/300x200?text=Product',
    isFeatured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    customerName TEXT NOT NULL,
    customerTitle TEXT DEFAULT '',
    rating INT NOT NULL DEFAULT 5,
    text TEXT NOT NULL,
    isFeatured BOOLEAN DEFAULT true,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    excerpt TEXT DEFAULT '',
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    coverImage TEXT DEFAULT '',
    author TEXT DEFAULT 'E Store Team',
    readTime TEXT DEFAULT '5 min read',
    publishedAt TEXT DEFAULT 'August 2026',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id BIGSERIAL PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribedAt TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 2. ENABLE ROW LEVEL SECURITY ==========
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- ========== 3. GRANT PERMISSIONS TO ANON ==========
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO anon;

-- ========== 4. CREATE RLS POLICIES (Unrestricted for practice) ==========

-- Products policies
DROP POLICY IF EXISTS products_select_all_anon ON public.products;
DROP POLICY IF EXISTS products_insert_all_anon ON public.products;
DROP POLICY IF EXISTS products_update_all_anon ON public.products;
DROP POLICY IF EXISTS products_delete_all_anon ON public.products;

CREATE POLICY products_select_all_anon ON public.products FOR SELECT TO anon USING (true);
CREATE POLICY products_insert_all_anon ON public.products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY products_update_all_anon ON public.products FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY products_delete_all_anon ON public.products FOR DELETE TO anon USING (true);

-- Reviews policies
DROP POLICY IF EXISTS reviews_select_all_anon ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_all_anon ON public.reviews;
DROP POLICY IF EXISTS reviews_update_all_anon ON public.reviews;
DROP POLICY IF EXISTS reviews_delete_all_anon ON public.reviews;

CREATE POLICY reviews_select_all_anon ON public.reviews FOR SELECT TO anon USING (true);
CREATE POLICY reviews_insert_all_anon ON public.reviews FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY reviews_update_all_anon ON public.reviews FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY reviews_delete_all_anon ON public.reviews FOR DELETE TO anon USING (true);

-- Blogs policies
DROP POLICY IF EXISTS blogs_select_all_anon ON public.blogs;
DROP POLICY IF EXISTS blogs_insert_all_anon ON public.blogs;
DROP POLICY IF EXISTS blogs_update_all_anon ON public.blogs;
DROP POLICY IF EXISTS blogs_delete_all_anon ON public.blogs;

CREATE POLICY blogs_select_all_anon ON public.blogs FOR SELECT TO anon USING (true);
CREATE POLICY blogs_insert_all_anon ON public.blogs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY blogs_update_all_anon ON public.blogs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY blogs_delete_all_anon ON public.blogs FOR DELETE TO anon USING (true);

-- Contact messages policies
DROP POLICY IF EXISTS contact_messages_select_all_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_insert_all_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_update_all_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_delete_all_anon ON public.contact_messages;

CREATE POLICY contact_messages_select_all_anon ON public.contact_messages FOR SELECT TO anon USING (true);
CREATE POLICY contact_messages_insert_all_anon ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY contact_messages_update_all_anon ON public.contact_messages FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY contact_messages_delete_all_anon ON public.contact_messages FOR DELETE TO anon USING (true);

-- Subscribers policies
DROP POLICY IF EXISTS subscribers_select_all_anon ON public.subscribers;
DROP POLICY IF EXISTS subscribers_insert_all_anon ON public.subscribers;
DROP POLICY IF EXISTS subscribers_update_all_anon ON public.subscribers;
DROP POLICY IF EXISTS subscribers_delete_all_anon ON public.subscribers;

CREATE POLICY subscribers_select_all_anon ON public.subscribers FOR SELECT TO anon USING (true);
CREATE POLICY subscribers_insert_all_anon ON public.subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY subscribers_update_all_anon ON public.subscribers FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY subscribers_delete_all_anon ON public.subscribers FOR DELETE TO anon USING (true);

-- ========== 5. INSERT SAMPLE DATA ==========

-- Sample products (ON CONFLICT DO NOTHING prevents duplicate errors)
INSERT INTO public.products (name, price, stock, category, image, isFeatured, rating, description) VALUES
('Wireless Mouse', 1200, 25, 'Accessories', 'https://via.placeholder.com/300x200?text=Wireless+Mouse', true, 4.5, 'High precision wireless mouse with ergonomic design'),
('USB-C Cable', 500, 60, 'Accessories', 'https://via.placeholder.com/300x200?text=USB-C+Cable', true, 4.0, 'Fast charging USB-C cable, 2 meter length'),
('LED Monitor 24 inch', 22000, 10, 'Monitors', 'https://via.placeholder.com/300x200?text=LED+Monitor', true, 4.8, 'Full HD LED monitor with 75Hz refresh rate'),
('Bluetooth Speaker', 3500, 40, 'Audio', 'https://via.placeholder.com/300x200?text=Bluetooth+Speaker', true, 4.3, 'Portable Bluetooth speaker with deep bass'),
('Laptop Stand', 2500, 30, 'Accessories', 'https://via.placeholder.com/300x200?text=Laptop+Stand', true, 4.2, 'Adjustable aluminum laptop stand'),
('HDMI Cable', 800, 100, 'Accessories', 'https://via.placeholder.com/300x200?text=HDMI+Cable', true, 4.1, 'High speed HDMI cable 4K support'),
('Mechanical Keyboard', 4500, 20, 'Accessories', 'https://via.placeholder.com/300x200?text=Keyboard', true, 4.7, 'RGB mechanical keyboard with blue switches'),
('Webcam HD', 3000, 15, 'Cameras', 'https://via.placeholder.com/300x200?text=Webcam+HD', true, 4.4, '1080p HD webcam with built-in microphone')
ON CONFLICT (id) DO NOTHING;

-- Sample reviews (ON CONFLICT DO NOTHING prevents duplicate errors)
INSERT INTO public.reviews (customerName, customerTitle, rating, text, isFeatured, "order") VALUES
('Rizwan Baloch', 'Verified Buyer — Laptop Customer', 5, 'I have experienced the most trustable website. I ordered a laptop from this website and it''s been 5 years — the build quality is amazing. The 24/7 service of this website is the best. I recommended this website to my loved ones.', true, 1),
('Zuhair Ahmed', 'Verified Buyer — Regular Customer', 5, 'Most of my friends are using this website and they randomly talk about this website''s features, services, and they also say that Zuhair, you wanna try this? I say yes. So one day I tried this website on behalf of my friends and I really enjoyed it. Now I recommend it to my family as well.', true, 2)
ON CONFLICT (id) DO NOTHING;

-- Sample blogs (ON CONFLICT DO NOTHING prevents duplicate slug errors)
INSERT INTO public.blogs (title, slug, excerpt, content, category, coverImage, author, readTime, publishedAt) VALUES
('Why Online Shopping Has Become Part of Everyday Life', 'why-online-shopping-everyday-life', 'A few years ago, online shopping was something people mostly used when they couldn''t find a product nearby. Today, things have changed. People now order clothes, groceries, accessories, toys, and many other everyday items online because it saves time and makes shopping more convenient...', 'A few years ago, online shopping was something people mostly used when they couldn''t find a product nearby. Today, things have changed. People now order clothes, groceries, accessories, toys, and many other everyday items online because it saves time and makes shopping more convenient.\n\nAt E Store, we understand that people don''t always have the time to visit different shops looking for what they need. Having different types of products in one place makes things a little easier. Customers can look through products, compare their options, place an order, and continue with their day.\n\nAnother reason people prefer online shopping is convenience. You can shop from home, at work, or even while relaxing at night. There is no need to deal with traffic or spend hours walking around different stores.\n\nOf course, online shopping is not only about convenience. Customers also want a store they can trust. Clear product information, reasonable prices, reliable delivery, and helpful customer support all make a difference.\n\nOur goal at E Store is to make everyday shopping feel simple rather than complicated. As online shopping continues to become a normal part of people''s lives, we want to provide a place where customers can find useful products without making the experience unnecessarily difficult.', 'Shopping Trends', 'https://via.placeholder.com/800x450?text=Online+Shopping', 'E Store Team', '5 min read', 'August 2026'),
('How E Store Is Making Shopping Simple for Everyone', 'how-e-store-making-shopping-simple', 'Shopping should not feel like a difficult task. Sometimes you only need one or two things, but finding them can take much longer than expected. That''s one of the reasons we created E Store — to bring different products together and make the shopping process easier...', 'Shopping should not feel like a difficult task. Sometimes you only need one or two things, but finding them can take much longer than expected. That''s one of the reasons we created E Store — to bring different products together and make the shopping process easier.\n\nE Store offers a variety of products for different needs, whether you''re looking for something for yourself, your family, or even a gift for someone. Instead of visiting several different stores, customers can browse through different categories from one place.\n\nWe also know that a good shopping experience doesn''t end when someone clicks the order button. Customers want to know when their order will arrive, have convenient payment options, and get help if something goes wrong. That''s why we focus on making these parts of the experience as straightforward as possible.\n\nFor us, E Store is more than just an online place to buy products. We want it to become a store that people can return to whenever they need something. We''re still growing and improving, and customer feedback plays an important part in that process.\n\nAt the end of the day, our aim is pretty simple: offer useful products, treat customers fairly, and make online shopping a little easier for everyone.', 'Company Updates', 'https://via.placeholder.com/800x450?text=E+Store+Simple+Shopping', 'E Store Team', '5 min read', 'August 2026')
ON CONFLICT (slug) DO NOTHING;
