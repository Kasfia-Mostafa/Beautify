# Beautify

Beautify is a modern e-commerce platform for transformative skincare and beauty products, featuring a full-featured admin dashboard, blog, and user management system. The project is split into a React + Vite frontend and a Node.js + Express + MongoDB backend.

![Project](https://github.com/Kasfia-Mostafa/Beautify/blob/3bb4631ff6d03589ac8663b4e70ac5bec4e47433/beautify.png)
---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Admin & Test Accounts](#admin--test-accounts)

---

## Project Overview
Beautify is a web application for a skincare and beauty brand. It allows users to browse, filter, and purchase products, read blogs, manage their profiles, and track orders. Admins and managers can manage products, orders, users, and content through a secure dashboard.

---

## Features

### User Features
- **Product Catalog**: Browse, search, and filter products by category, type, and price.
- **Product Details**: View detailed product info, variants, stock, and add to cart or wishlist.
- **Cart & Checkout**: Manage cart, update quantities, and checkout with Stripe integration.
- **Wishlist**: Save products for later (syncs for logged-in users).
- **Authentication**: Register, login, and manage profile and address.
- **Order Tracking**: View order history and status.
- **Blog**: Read categorized articles, like posts, and filter by category.
- **Contact & About**: Brand story, commitments, and contact form.
- **Newsletter**: Subscribe for updates.

### Admin/Manager Features
- **Dashboard**: View revenue, profit, order stats, and top-selling products.
- **Product Management**: Add, edit, delete, and feature products with image uploads (Cloudinary).
- **Order Management**: View, filter, and update order statuses.
- **User Management**: View users, update roles (admin, manager, user), and see role summaries.
- **Blog Management**: Create, edit, and delete blog posts.
- **Revenue Analytics**: Visualize sales and profit trends.
- **Activity Logging**: Track admin actions and changes.

---

## Tech Stack

### Frontend
- **React 19** (with Context API for state management)
- **Vite** (fast build tool)
- **Tailwind CSS** (custom theming, responsive design)
- **React Router v7** (routing)
- **React Hot Toast** (notifications)
- **Stripe.js** (payments)
- **ESLint** (linting)

### Backend
- **Node.js** (Express.js server)
- **MongoDB** (Mongoose ODM)
- **JWT** (authentication)
- **BcryptJS** (password hashing)
- **Cloudinary** (image uploads)
- **Multer** (file uploads)
- **Stripe** (payment processing)
- **CORS, dotenv** (utilities)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env with MongoDB URI, JWT secret, Stripe, and Cloudinary keys
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Accounts
See `backend/Test.txt` for ready-to-use admin, manager, and user credentials.

---

## Folder Structure

```
Beautify/
├── backend/
│   ├── models/           # Mongoose schemas (User, Product, Order, Blog, Activity)
│   ├── data/             # Seed data for products, blogs, etc.
│   ├── server.js         # Main Express server
│   ├── seeder.js         # Product seeder script
│   ├── blogSeeder.js     # Blog seeder script
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Layouts, Admin/User panels
│   │   ├── context/      # Auth, Cart, Wishlist providers
│   │   ├── pages/        # Home, Shop, Product, Blog, Admin, etc.
│   │   └── ...
│   ├── public/           # Static assets
│   ├── App.jsx           # Main app entry
│   └── ...
└── ...
```

---

## Admin & Test Accounts
See [backend/Test.txt](backend/Test.txt) for sample admin, manager, and user credentials, as well as test card details.
