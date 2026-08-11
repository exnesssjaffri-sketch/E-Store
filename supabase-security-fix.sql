-- =============================================
-- E-STORE SUPABASE SECURITY FIX
-- Run this in: Supabase Dashboard → SQL Editor
-- Fixes Security Advisor warnings (RLS + Permissions)
-- =============================================

-- ========== 1. ENABLE RLS ON ALL TABLES ==========
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- ========== 2. REVOKE ALL BROAD ANON PERMISSIONS ==========
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.reviews FROM anon;
REVOKE ALL ON public.blogs FROM anon;
REVOKE ALL ON public.contact_messages FROM anon;
REVOKE ALL ON public.subscribers FROM anon;

-- ========== 3. GRANT LEAST-PRIVILEGE PERMISSIONS ==========
-- Public read-only tables (products, reviews, blogs)
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.blogs TO anon;

-- Public write tables (contact form, newsletter)
GRANT SELECT, INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT ON public.subscribers TO anon;

-- ========== 4. DROP ALL OLD POLICIES ==========
-- Products
DROP POLICY IF EXISTS products_select_all_anon ON public.products;
DROP POLICY IF EXISTS products_insert_all_anon ON public.products;
DROP POLICY IF EXISTS products_update_all_anon ON public.products;
DROP POLICY IF EXISTS products_delete_all_anon ON public.products;

-- Reviews
DROP POLICY IF EXISTS reviews_select_all_anon ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_all_anon ON public.reviews;
DROP POLICY IF EXISTS reviews_update_all_anon ON public.reviews;
DROP POLICY IF EXISTS reviews_delete_all_anon ON public.reviews;

-- Blogs
DROP POLICY IF EXISTS blogs_select_all_anon ON public.blogs;
DROP POLICY IF EXISTS blogs_insert_all_anon ON public.blogs;
DROP POLICY IF EXISTS blogs_update_all_anon ON public.blogs;
DROP POLICY IF EXISTS blogs_delete_all_anon ON public.blogs;

-- Contact messages
DROP POLICY IF EXISTS contact_messages_select_all_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_insert_all_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_update_all_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_delete_all_anon ON public.contact_messages;

-- Subscribers
DROP POLICY IF EXISTS subscribers_select_all_anon ON public.subscribers;
DROP POLICY IF EXISTS subscribers_insert_all_anon ON public.subscribers;
DROP POLICY IF EXISTS subscribers_update_all_anon ON public.subscribers;
DROP POLICY IF EXISTS subscribers_delete_all_anon ON public.subscribers;

-- ========== 5. CREATE SECURE RLS POLICIES ==========

-- PRODUCTS: Public read only. Write requires authentication.
CREATE POLICY products_select_anon ON public.products
    FOR SELECT TO anon USING (true);

CREATE POLICY products_insert_auth ON public.products
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY products_update_auth ON public.products
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY products_delete_auth ON public.products
    FOR DELETE TO authenticated USING (true);

-- REVIEWS: Public read only. Write requires authentication.
CREATE POLICY reviews_select_anon ON public.reviews
    FOR SELECT TO anon USING (true);

CREATE POLICY reviews_insert_auth ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY reviews_update_auth ON public.reviews
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY reviews_delete_auth ON public.reviews
    FOR DELETE TO authenticated USING (true);

-- BLOGS: Public read only. Write requires authentication.
CREATE POLICY blogs_select_anon ON public.blogs
    FOR SELECT TO anon USING (true);

CREATE POLICY blogs_insert_auth ON public.blogs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY blogs_update_auth ON public.blogs
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY blogs_delete_auth ON public.blogs
    FOR DELETE TO authenticated USING (true);

-- CONTACT MESSAGES: Public can submit (INSERT). Read requires auth.
CREATE POLICY contact_messages_insert_anon ON public.contact_messages
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY contact_messages_select_auth ON public.contact_messages
    FOR SELECT TO authenticated USING (true);

CREATE POLICY contact_messages_update_auth ON public.contact_messages
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY contact_messages_delete_auth ON public.contact_messages
    FOR DELETE TO authenticated USING (true);

-- SUBSCRIBERS: Public can subscribe (INSERT). Read requires auth.
CREATE POLICY subscribers_insert_anon ON public.subscribers
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY subscribers_select_auth ON public.subscribers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY subscribers_update_auth ON public.subscribers
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY subscribers_delete_auth ON public.subscribers
    FOR DELETE TO authenticated USING (true);

-- ========== 6. VERIFY SETUP ==========
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;