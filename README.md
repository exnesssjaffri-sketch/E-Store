# ⚡ E-Store — Electronics E-Commerce Website

A complete 5-page electronics e-commerce website built with **Node.js + Express** backend and **HTML/CSS/JavaScript** frontend. Data is stored in JSON files - no database required.

## 📋 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero section, testimonials, featured products, newsletter |
| About Us | `/about` | Our goal, mission, and why choose us |
| Services | `/services` | 7 service cards with detailed descriptions |
| Blogs | `/blogs` | Blog posts with full content in modal |
| Contact Us | `/contact` | Contact form, info, and Google Maps |

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js, CORS
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
- **Data Storage:** JSON files (products.json, reviews.json, blogs.json, etc.)
- **Deployment:** Vercel (both frontend + backend)

## 🎨 Design System

- **Colors:** Primary `#0F172A`, Secondary `#2563EB`, Accent `#F97316`
- **Typography:** Inter font family
- **Animations:** Scroll reveal (Intersection Observer), hero fade-in, card hover effects
- **Responsive:** Desktop, Tablet, Mobile

## 🛠️ Local Development

### 1. Install dependencies
```bash
cd e-store/backend
npm install
```

### 2. Start the backend server
```bash
cd e-store/backend
node server.js
```

### 3. Open the app
Visit `http://localhost:5000` in your browser. The server serves the frontend automatically.

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports `?featured=true`, `?search=`, `?category=`) |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/:id` | Get a single product |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/reviews?featured=true` | Get reviews |
| GET | `/api/blogs` | Get blog posts (supports `?category=`, `?limit=`) |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |
| GET | `/api/settings` | Get site settings |

## 📁 Project Structure

```
e-store/
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json        # Backend dependencies
│   ├── products.json       # Product data
│   ├── reviews.json        # Review/testimonial data
│   ├── blogs.json          # Blog post data
│   ├── contact-messages.json  # Contact form submissions
│   └── subscribers.json    # Newsletter subscribers
├── frontend/
│   ├── index.html          # Home page
│   ├── about.html          # About Us page
│   ├── services.html       # Services page
│   ├── blogs.html          # Blogs page
│   ├── contact.html        # Contact Us page
│   ├── style.css           # Global styles
│   └── script.js           # Global JavaScript (API integration)
├── vercel.json             # Vercel deployment config
├── .gitignore
└── README.md
```

## 🚢 Deployment

### Deploy to Vercel
1. Push this repository to GitHub
2. Go to [Vercel](https://vercel.com) and import the repository
3. Set **Root Directory** to `e-store`
4. Vercel will automatically detect the `vercel.json` config
5. Deploy!

The frontend and backend API will be served from the same Vercel domain.

## ✨ Features

- ✅ Complete CRUD operations (products API)
- ✅ Responsive design (mobile-first)
- ✅ Scroll reveal animations
- ✅ Hero section with fade-in animation
- ✅ Card hover effects (lift + shadow)
- ✅ Toast notifications
- ✅ Contact form with validation
- ✅ Newsletter subscription
- ✅ Blog detail modal
- ✅ Loading states and error handling
- ✅ Accessibility (prefers-reduced-motion, focus indicators)
- ✅ SEO meta tags on all pages