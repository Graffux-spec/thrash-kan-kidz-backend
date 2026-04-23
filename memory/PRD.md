# Thrash Kan Kidz - Product Requirements Document

## Overview
Mobile card-collecting app featuring thrash/death metal parody cards. Users open card packs, acquire random cards with series-based progression, and trade duplicates for alternate art variants.

## Tech Stack
- **Frontend**: React Native (Expo), deployed via EAS to Google Play
- **Backend**: FastAPI, deployed to Render.com
- **Database**: MongoDB Atlas (production)
- **Billing**: Google Play Billing via `react-native-iap`

## Core Features (Implemented)
- Card pack opening (50 coins per spin)
- Series 1-5 fully populated (405 cards total: 80 base + 320 variants + 5 reward)
- Series toggle in shop UI
- Variant trade-in system (5 dupes -> random variant)
- 200-coin bonus for completing all 4 variants of a card
- Duplicate cap: max 6 per base card, 70% priority on unowned cards
- User-to-user trading with notification badge
- Google Play Billing (IAP) with backend verification
- Privacy policy and delete account endpoints for Play Store compliance
- Custom Expo plugin to block READ_MEDIA_IMAGES permission

## Key Architecture Notes
- Frontend API URL is hardcoded as fallback in `app.json` extra config (EAS strips `.env`)
- Backend seed skips if 405 cards exist (prevents cold-start delays on Render)
- Targeted name_fixes dict in seed_database() handles DB corrections without full re-seed

## Series Content
- Series 1: 16 base + 64 variants + 1 reward = 81 cards
- Series 2: 16 base + 64 variants + 1 reward = 81 cards
- Series 3: 16 base + 64 variants + 1 reward = 81 cards
- Series 4: 16 base + 64 variants + 1 reward = 81 cards
- Series 5: 16 base + 64 variants + 1 reward = 81 cards

## Completed (April 19, 2026)
- In-app feedback system (Profile → Send Feedback) with 1-5 star ratings + text
- Backend endpoints: POST /api/feedback, GET /api/feedback (admin)
- Fixed user cards crash (missing acquired_at/quantity fields) — affected Drifter7 and others
- New users start with 500 coins (was 100)
- Admin coin top-up endpoint: POST /api/admin/add-coins/{user_id}
- Fixed "Jeff Possess Ya" card names in DB
- Added Series 5 tally with flexWrap layout fix
- Force-pushed code to Graffux-spec repo for Render deployment
- Collapsible series sections in Collection page (tap to expand/collapse each series)
- Reward cards now visible in their respective series section
- Swapped Chum Araya Hellfire/Cosmic images (were reversed)
- Swapped Party Tardy Diamond/Oceanic images (were reversed)
- Switched to expo-image for trade-in and spinner result images (fixes blank images on Android for large PNGs)
- Fixed Mille Vanille variant descriptions (said "Silly Mille" instead of "Mille Vanille")
- Bigger spin result card image (180x260) with background fallback
- Friends system backend complete (send/accept/reject requests, search by username/code, friend codes, trade gating)
- Transferred Hellbound cards (100) to hellboundjeff@gmail.com account

## In Progress
- COMPLETED: Daily Wheel + Medal System + Pack Reroll

## Completed (April 20, 2026)
- Daily Spin Wheel: Popup on app open, 8 prize slices, 7-day streak bonus, animated spin
- Medal System: Earn from wheel, spend on rerolls (3 medals) or free packs (10 medals)
- Pack Reroll: After opening, spend 3 medals to replace all 3 cards with new random ones
- 3-card packs at 75 coins (was 1 card at 50)
- Friends system: Search by username/code, send/accept requests, gate trading behind friendship
- Friends UI on Trade page with tabs, friend codes, and trade-with button

## Upcoming
- P1: Confirm Google Play Store review
- P2: Series 6+ content (awaiting user request)

## Completed (April 23, 2026 — current session)
- Restored IAP purchase flow with `expo-iap@4.2.1` (P1 unblocked)
  - Added `expo-iap` + `expo-build-properties` (Kotlin 2.1.20) Expo plugins in app.json
  - Replaced stubbed `BuyCoinsModal.tsx` with real `useIAP` hook-based flow: `fetchProducts` → `requestPurchase` → `onPurchaseSuccess` → backend verify → `finishTransaction({isConsumable: true})`
  - Removed obsolete custom `billing-plugin.js` (expo-iap plugin now injects BILLING perm + Billing Library 8.x itself)
  - Bumped Android `versionCode` 24 → 25, version 1.7.0 → 1.8.0 — user must trigger new EAS build & upload to Play Console
- Backend modular refactor (phase 1) — P2 Backlog item started
  - New `/app/backend/routers/` package with `feedback.py` (3 endpoints) and `friends.py` (5 endpoints) sub-routers mounted onto `api_router`
  - Removed the inline endpoint implementations from `server.py` (3601 → 3407 lines, -194 lines)
  - Deleted stale `/app/backend/routes/` folder (never imported, left over from a previous abandoned refactor)
  - All curl tests pass: /api/feedback, /api/feedback/view, /api/friends/{id}, /api/friends/{id}/requests, plus unchanged endpoints /api/cards, /api/users, /api/daily-wheel, /api/goals, /api/coin-packages

## Backlog
- Refactor remaining server.py endpoints into `routers/` modules: `auth.py` (4 endpoints), `daily_wheel.py` (5 endpoints), `payments.py` (~6 endpoints), `cards.py`, `spin.py`, `trades.py`, `goals.py`
- Split cards_data.py by series
- Server-side Google Play purchase token validation against Google Play Developer API (currently backend trusts client token — low priority given closed testing only)
