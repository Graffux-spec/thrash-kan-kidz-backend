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

## Upcoming
- P1: Confirm Google Play Store review (Internal Testing track)
- P2: Series 6+ content (awaiting user request)

## Backlog
- Refactor server.py into route modules (auth, cards, shop, trades)
- Split cards_data.py by series
