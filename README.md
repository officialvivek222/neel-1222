# Neel Hair - Review & QR Feedback Platform (ReviewTap)

A high-converting, mobile-first and desktop-responsive customer feedback and QR review management web application built for **Neel Hair** (Hair • Style • Grooming) powered by **ReviewTap**.

---

## 📱 Features & Visuals Overview

### 1. Customer-Facing QR Experience (Mobile-First)
- **Customer Landing Screen** (`/`):
  - Luxurious dark salon backdrop with warm ambient lighting.
  - Golden crown & crossed shears **Neel Hair** vector logo with *"Hair • Style • Grooming"* badge.
  - Language switcher (`EN`, `HI`, `MR`).
  - Hero review card with golden ribbon arch header:
    - *"Thank You for Visiting! Your experience means a lot to us."*
    - 5 glowing golden sparkle stars.
    - **"Review Us on Google"** primary action button with Google icon (tracks click count and opens Google review page).
    - **"Share Your Feedback"** button to open direct feedback form.
    - Salon values: *Professional Service*, *Experienced Stylists*, *Clean & Hygienic Environment*.
    - *"Powered by ReviewTap"* branding.

- **Customer Feedback Form** (`feedback-form`):
  - Header with back arrow `<` and logo.
  - Interactive 5-star rating selector with live score indicator badge (e.g. `4 / 5`).
  - Service selection dropdown: *Haircut*, *Beard Trim*, *Hair Styling*, *Hair Color*, *Facial & Spa*, *Head Massage*, etc.
  - Customer name (optional) & feedback comment textarea.
  - Blue pill submission button with animated transition.

- **Customer Success / Thank You Screen** (`thank-you`):
  - Green circular checkmark with sunburst celebration rays.
  - Festive confetti celebration animation.
  - *"Thank You! Your feedback has been successfully submitted."*
  - 5-star speech bubble badge.
  - *"Back to Home"* button to return to the welcome screen.

---

### 2. Admin Authentication (`/admin/login`)
- Desktop split-screen layout & mobile responsive stacked card.
- **Left Hero Side**:
  - Salon interior background with curved golden wave separator.
  - Neel Hair logo + *"Admin Portal"* shield badge.
  - Feature highlights: *View Reviews & Ratings*, *Manage Feedback*, *Generate QR Code*, *Business Settings*.
- **Right Login Card**:
  - Soft lilac/purple glow with security lock badge.
  - Email & Password fields with show/hide eye toggle.
  - Remember me checkbox & Forgot password link.
  - *"Login to Dashboard"* button.
  - **Quick Demo Login (1-Click)** button for instant exploration without typing.

---

### 3. Admin Portal
- **Persistent Left Sidebar** (Desktop fixed + Mobile slide-out drawer + Mobile bottom thumb bar):
  - Neel Hair logo & ReviewTap badge.
  - Active tab indicator pill with vivid purple gradient.
  - Quick toggle to switch between Admin Portal and Customer QR view.

- **Top Bar**:
  - Dynamic page title & description.
  - Date Range filter dropdown (*Last 30 Days*, *Last 7 Days*, *Today*, *This Month*, *All Time*).
  - Notification bell with unread indicator and popover preview.
  - Business profile avatar (*"N" Neel Hair*) with dropdown menu.

- **Dashboard View**:
  - 4 Key Metrics:
    - Total QR Scans: `1,268` (+18%)
    - Google Review Clicks: `842` (+24%)
    - Feedback Received: `126` (+12%)
    - Average Store Rating: `4.6 / 5`
  - **Activity Over Time Chart**: Smooth responsive SVG bezier curve chart (Purple QR Scans line + Cyan Google Clicks line) with hover date tooltips.
  - **Rating Distribution**: Interactive breakdown bars for 5★ (68%), 4★ (17%), 3★ (8%), 2★ (4%), 1★ (3%).
  - **Recent Feedback List**: Customer avatars, service badges, star ratings, quotes, dates, and *"View All"* link.
  - **Quick Actions**: *Download QR Code*, *Update Details*.

- **Customer Feedback Management Table**:
  - 4 KPI cards: Total Feedback, Average Rating, 5-Star Feedback, Resolved count.
  - Live search filter by customer name, service, or keyword.
  - Dropdown filters for Ratings (1-5★), Services, and Status (Resolved / Pending).
  - **Export CSV**: Triggers genuine `.csv` file download of all customer feedback.
  - Responsive data table on desktop + clean mobile cards.
  - 1-click Status toggle between `Resolved` and `Pending`.
  - Detailed modal view on row click.
  - Pagination controls (`< 1 2 3 ... 26 >`).

- **QR Code Management**:
  - Live generated QR code matching destination URL with purple styling corner brackets and center Neel Hair logo.
  - **Download QR**: Generates custom high-res PNG image with header, logo, and counter instructions.
  - **Share Link**: Copies review destination URL to clipboard with toast notification.
  - **Print Salon Counter Tent Card**: Printable modal preview ready for salon front desk display!
  - Performance metrics: Scans, Google Clicks, Feedback count.
  - Customization options: Change logo, switch QR style (Classic, Dots, Rounded, Target), and Reset.
  - Destination URL management with 1-click copy.

- **Business Settings**:
  - Tabs: *Business Details*, *Review Settings*, *Notifications*, *Appearance*, *Security*.
  - Business Name, Tagline, Category, Contact Number, and Business Address.
  - Business Logo upload & removal.
  - Google Review Link configuration & test copy.
  - Landing page toggles: *Show Google Review Button*, *Show Feedback Form*.
  - Reactive state with Discard / Save Changes buttons synced to localStorage.

- **Google Reviews Screen**:
  - Google Business Profile stats: 4.8 / 5 rating across 342 reviews.
  - Direct review URL tester.
  - Synced reviews feed with owner reply composer.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom palette (royal purple, metallic gold, slate navy)
- **Icons**: Lucide React
- **Animations & Effects**: canvas-confetti, Tailwind animations
- **QR Engine**: qrcode
- **State Management**: React Context with LocalStorage persistence

---

## 🚀 Running the Frontend

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🔌 Connecting to Supabase Backend (Next Step)

The frontend data structures (`src/types/index.ts` and `src/context/AppContext.tsx`) were deliberately engineered to match standard Supabase PostgreSQL tables:

### Recommended Supabase SQL Schema:

```sql
-- 1. Businesses / Salons table
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Neel Hair',
  tagline text default 'Hair • Style • Grooming',
  category text default 'Hair Salon / Barber Shop',
  contact_number text default '+91 87674 70988',
  address text default 'Ozar, Nashik, Maharashtra',
  logo_url text,
  google_review_link text,
  show_google_review_btn boolean default true,
  show_feedback_form boolean default true,
  qr_destination_url text,
  qr_style text default 'classic',
  created_at timestamptz default now()
);

-- 2. Customer Feedback table
create table feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  service text not null,
  feedback_text text,
  phone text,
  status text default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz default now()
);

-- 3. Analytics / Scans table
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  event_type text not null check (event_type in ('qr_scan', 'google_click', 'feedback_submitted')),
  created_at timestamptz default now()
);
```
