# Loy Jai (ลอยใจ) — Wishes Across Lands (ลอยความหวังข้ามแดน)

> **One river. Every generation. Release a wish in ten seconds.**

**Loy Jai (`ลอยใจ`)** is a calm, frictionless digital river and night-sky experience built for Loy Krathong—allowing people across distances and generations to step-by-step craft and release a krathong or lantern, watch wishes drift alongside others, and share a warm gift-card link with family and friends.

---

## Project Overview

### Problem & Solution
* **The Problem:** Younger generations studying or working away from home often miss quiet family traditions, while older generations (55+) can feel left behind by noisy, text-heavy festival apps or complex onboarding.
* **The Solution:** A single-action web experience with no login or app download required, where users can build a krathong or lantern step-by-step (supporting cultural literacy and personalization) and send a wish floating across the sky or river.

### Target Personas
1. **Primary Bridge — The "Sender" (Ages 18–35):** Students living abroad, young professionals, and travelers who want to release a wish quickly and share a personal link in family LINE or WhatsApp chats.
2. **Secondary User — The "Elder" (Ages 55+):** Parents and grandparents using LINE/WhatsApp on phones or tablets who benefit from simple controls, large touch targets, clear Thai/English/Chinese support, no heavy WebGL2 requirements, and transparent creator trust.

### Core Features
* **Step-by-Step Krathong & Lantern Builder:** Interactive crafting flow across base, flower/decor, and wish details to encourage cultural meaning and personalization.
* **Shared Wish Pool & Live Stats:** Real-time stats and floating lanterns/krathongs backed by PostgreSQL so visitors immediately experience a shared river and sky.
* **Gift-Card Shareable Links (`?wish=<id>` / `/w/<wish_id>`):** Shareable links with ready-to-send captions and Open Graph preview support for chat apps.
* **Ambient & Tactile Audio:** Toggleable river/night ambience (`water-flowing.mp3`, `birds-chirping.mp3`) paired with custom interaction sound effects (`switch-sound.mp3`, `banana-leaf.mp3`, `pop.mp3`, `water-splash.mp3`, `lantern-fly.mp3`, `wish.mp3`).
* **Creator Trust & Info Modal (`ⓘ`):** Header attribution (`Created by student @th4mez_.adv`) and a multilingual creator note (`TH` / `EN` / `ZH`).

---

## Tech Stack

| Layer | Technology | Role in Loy Jai |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Interactive UI, step-by-step krathong/lantern builder, live wish canvas, and gift-card sharing |
| **Frontend Hosting** | Vercel | Production static/SPA deployment (`npm run build` / Vite production bundling) |
| **Backend** | FastAPI + Uvicorn | REST API for wishes (`GET /api/wishes`, `POST /api/wishes`), stats (`GET /api/stats`), health checks, and share preview routes |
| **Backend Hosting** | Render | Managed Python web service hosting (`https://loyjai.onrender.com`) |
| **Database** | Neon PostgreSQL | Persistent storage for shared wishes and aggregate counts |

---

## Project Structure & Environment Variables

### Typical Layout
```text
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── images/
    │   │   └── profile.png
    │   └── assets/
    │       ├── images/
    │       │   └── og-preview.png
    │       └── sounds/
    └── src/