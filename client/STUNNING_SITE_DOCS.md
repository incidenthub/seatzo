# Stunning Website - Design System & Component Documentation

## Overview
This project is a high-end, visually stunning website built with React, TailwindCSS, and Framer Motion. It follows the aesthetic standards of top-tier design showcases like Awwwards.com.

## Tech Stack
- **Framework:** React 18
- **Styling:** TailwindCSS (Utility-first CSS)
- **Animations:** Framer Motion (Scroll-triggered, transitions, parallax)
- **Icons:** Lucide React
- **Typography:** Inter (Body), Lexend (Display)

## Component Structure

### Layout Components
- **Navbar:** Floating, glass-effect navigation with scroll-triggered background changes and mobile responsiveness.
- **Footer:** Multi-column, dark-themed footer with integrated social links and site navigation.

### Home Page (`/`)
- **Hero Section:** Uses Framer Motion for staggered entrance animations. Features a large, bold display title and a glass-effect floating badge.
- **Featured Work Grid:** A responsive 2-column grid showcasing projects with hover-triggered image scaling and overlay effects.
- **Features Section:** 3-column layout highlighting key value propositions with subtle lift animations on hover.

### About Page (`/about`)
- **Parallax Imagery:** Implemented using `useScroll` and `useTransform` from Framer Motion for smooth depth effects.
- **Timeline:** A vertical timeline that reveals items as they scroll into the viewport using `whileInView`.
- **Team Section:** Interactive cards with grayscale-to-color transitions and social link overlays.

### Contact Page (`/contact`)
- **Validation Form:** Real-time feedback for required fields and email formatting. Includes a loading state for submission.
- **Map Visualization:** A custom-styled static map representation with a pulsing location indicator.

## Animation Specifications
- **Staggered Entrance:** 0.2s delay between child elements.
- **Smooth Scroll Transitions:** `[0.6, 0.05, -0.01, 0.9]` cubic-bezier for a high-end feel.
- **Parallax Ratio:** 0.2-0.5 speed relative to scroll.

## Performance Optimization
- **Code Splitting:** All major routes are lazy-loaded via `React.lazy()`.
- **Image Optimization:** Used high-quality Unsplash URLs with dynamic formatting parameters (`auto=format&fit=crop`).
- **CSS Efficiency:** TailwindCSS ensures minimal CSS bundle size by purging unused styles.

## Deployment Instructions
1. Run `npm install` to install dependencies.
2. Run `npm run build` to generate the production-ready `dist/` folder.
3. Deploy the `dist/` folder to any static hosting provider (Vercel, Netlify, etc.).
4. Ensure `VITE_API_BASE_URL` is set in the production environment for backend connectivity.
