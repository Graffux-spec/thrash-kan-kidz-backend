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

## Completed (April 15, 2026)
- Fixed "Jeff Possess Ya" card names in DB (was "Chef Becerra" for S2 A-type base + 4 variants)
- Added forced DB name correction in seed_database() that runs even when seed is skipped
- Added Series 5 tally (S5: X/16) to Collection page header

## Upcoming
- P1: Confirm Google Play Store review (Internal Testing track)
- P2: Series 6+ content (awaiting user request)

## Backlog
- Refactor server.py into route modules (auth, cards, shop, trades)
- Split cards_data.py by series
