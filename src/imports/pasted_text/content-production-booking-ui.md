Design a modern, scalable web platform UI/UX for a **Content Production & Booking System** that supports BOTH:

* Phase 1 (MVP – internal use, simplified)
* Phase 2 (Full system – advanced features)

The system MUST support **Feature Toggle (Admin-controlled)** where advanced features are hidden/locked until enabled by Admin.

---

# 🎯 CORE GOAL

* Easy for internal operation (Phase 1)
* Scalable to full marketplace (Phase 2)
* Clean, visual, professional
* Focus on workflow clarity (job → production → delivery)

---

# 🎨 DESIGN STYLE

* Primary: Black (#0B0B0B), White (#FFFFFF)
* Accent: Neon Blue / Purple glow
* Style:

  * Glassmorphism
  * Soft shadow
  * Rounded corners (16–24px)
* Smooth animation, hover glow
* Visual-first (image/video heavy)

---

# 🧠 SYSTEM ARCHITECTURE

The UI must clearly support:

1. Job System (core)
2. Booking System
3. Profile & Portfolio
4. Chat + Notification
5. Blog + Feed + Job Story
6. Admin Control Panel (Feature Toggle + Management)

---

# 🔐 FEATURE TOGGLE SYSTEM (CRITICAL)

Design a system where:

* Certain features are LOCKED in Phase 1
* Admin can ENABLE them

---

## UI REQUIREMENTS:

* Locked feature = blurred / disabled UI
* Label:

  * “Coming Soon”
  * “Admin Locked”
* Unlock animation when enabled

---

## FEATURES THAT CAN BE TOGGLED:

* Payment / Wallet
* Rank system advanced
* File approval system
* Advanced chat (reply, mention)
* Booking negotiation
* Public marketplace access

---

---

# 🏠 HOMEPAGE

* Hero:
  “Create Content. Book Talent. Scale Production”
* CTA:

  * Start Project
  * Explore Creators
* Showcase (video/image grid)
* How it works
* Featured creators
* Latest Job Stories
* CTA banner

---

---

# 👤 PROFILE PAGE

## Top:

* Avatar
* Name
* Rank badge (locked if Phase 1)
* Rating (locked if Phase 1)
* Completed jobs
* Book Now button

---

## Tabs:

### Portfolio

* Image/video grid

### Projects

* Completed jobs preview

### Reviews (locked if Phase 1)

---

---

# 📅 BOOKING PAGE

## Form:

* Date picker
* Location
* Job type
* Budget
* Description
* Upload references

---

## Phase behavior:

* Phase 1:
  → Simple submit → create job

* Phase 2:
  → Negotiation UI (price adjust, accept/reject)

---

---

# 📋 JOB DASHBOARD

## Layout:

* Sidebar navigation
* Job list

---

## Job Card:

* Title
* Participants
* Status badge
* Deadline

---

---

# 📊 JOB DETAIL PAGE

## Top:

* Title
* Progress bar (timeline)

---

## Sections:

### Overview

* Description
* Requirements

---

### Participants

* Model
* Photographer
* Editor

---

### Chat

* Real-time chat UI

---

### Files

## Phase 1:

* Upload
* Preview

## Phase 2 (LOCKED initially):

* Approve button (green)
* Request revision (red)
* Watermark overlay

---

---

# 💬 CHAT SYSTEM

## Phase 1:

* Basic chat
* Send message
* Upload file

---

## Phase 2 (locked):

* Reply thread
* Mention @
* Message reactions

---

---

# 🔔 NOTIFICATION

* Bell icon
* Dropdown list
* Unread badge

---

---

# 📸 FEED

* Vertical feed
* Post:

  * image/video
  * caption

---

---

# 🔥 JOB STORY

Auto-generated post:

* image/video
* title
* participants
* description

---

---

# ✍️ BLOG

* Blog list
* Blog detail
* CTA to booking/profile

---

---

# 👑 ADMIN DASHBOARD (CRITICAL)

Design a powerful admin panel.

---

## Layout:

* Sidebar:

  * Dashboard
  * Users
  * Jobs
  * Features (IMPORTANT)
  * Finance
  * Content

---

---

## 🧩 FEATURE CONTROL PANEL (MOST IMPORTANT)

### Toggle switches:

* Enable Payment System
* Enable Rank System
* Enable File Approval
* Enable Advanced Chat
* Enable Booking Negotiation
* Enable Public User Registration

---

## UI:

* Toggle ON/OFF switch
* Status indicator:

  * Active / Disabled
* Description per feature

---

---

## 👥 USER MANAGEMENT

* List users:

  * Model
  * Photographer
* Approve / Reject
* View profile

---

---

## 📋 JOB MANAGEMENT

* View all jobs
* Assign participants (drag-drop)
* Change status

---

---

## 💰 FINANCE (Phase 2 locked)

* Platform earnings
* Job payments
* Wallet balances

---

---

## 📊 DASHBOARD OVERVIEW

* Total jobs
* Active users
* Revenue (locked Phase 1)
* Activity chart

---

---

# 🏆 RANK SYSTEM (LOCKED INITIALLY)

* Newbie
* Rising
* Pro
* Elite

Badge design:

* Gray
* Blue
* Purple
* Gold glow

---

---

# 🎬 INTERACTIONS

* Hover glow
* Smooth transitions
* Unlock animation when feature enabled

---

---

# 📱 RESPONSIVE

* Desktop first
* Mobile:

  * bottom navigation
  * stacked layout

---

---

# 🎯 FINAL EXPERIENCE

The platform should feel like:

* A mix of:

  * Production studio system
  * Creator marketplace
  * Visual portfolio platform

---

Focus on:

* clarity of workflow
* visual hierarchy
* ease of use
* scalability
