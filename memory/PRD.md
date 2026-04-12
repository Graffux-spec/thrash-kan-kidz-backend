# Thrash Kan Kidz - Product Requirements Document

## Overview
A mobile card collecting app featuring thrash/death metal parody cards. Users open card packs for 50 coins to acquire random cards with a series-based progression system.

## Live Deployment
- **Backend:** https://thrash-kan-kidz-api.onrender.com
- **Database:** MongoDB Atlas (cluster0.fzhrzyb.mongodb.net)
- **GitHub Repo:** https://github.com/Graffux-spec/thrash-kan-kidz-backend
- **App:** Google Play Console - Internal Testing (Version 12)

## Core Features (Implemented)
- Card pack opening mechanic (50 coins per spin)
- Series-based progression (Series 1-4)
- 16 common cards per series (8 bands with A/B cards)
- Rare/Epic reward cards for completing series
- Series 1-3 variant cards (Organic, Metal, Steampunk, Glitched)
- Password authentication (bcrypt hashing)
- Collection view with mystery cards for unowned cards
- Coin purchase system (Stripe integration)
- Daily login rewards

## Tech Stack
- **Frontend:** React Native (Expo), EAS Build
- **Backend:** FastAPI, Python
- **Database:** MongoDB Atlas
- **Hosting:** Render.com (Free Tier)
- **Payments:** Stripe

## Credentials
- Test User: `Graffux` / `Thrashpw06!`

---

## Completed Work (April 6, 2026)

### Render Deployment (MAJOR MILESTONE)
- Fixed `emergentintegrations` dependency issue (replaced with standard `stripe` library)
- Pushed backend to `Graffux-spec/thrash-kan-kidz-backend`
- Configured Render with correct repo and root directory (`backend`)
- Set up MongoDB Atlas connection with proper Network Access (0.0.0.0/0)
- Added environment variables: `MONGO_URL`, `DB_NAME`
- **Backend now live at permanent URL** - no more expiring preview URLs!

### Previous Session Work
- Implemented Series 1-4 cards with user-provided artwork
- Added 64 Series 3 variant images
- Built password authentication system
- Fixed Android OS navigation button overlap
- Fixed collection.tsx crash (FlashList → FlatList)
- Multiple AAB builds (up to Version 12)

---

## Series 4 Variant Progress (Updated April 11, 2026) - COMPLETE!
- [x] Tardy Donald (Skeletal, Oceanic, Diamond, Stoned)
- [x] Party Tardy (Skeletal, Oceanic, Diamond, Stoned)
- [x] Boy George Fisher (Skeletal, Oceanic, Diamond, Stoned)
- [x] Steve Trucker (Skeletal, Oceanic, Diamond, Stoned)
- [x] George Porkgrinder (Skeletal, Oceanic, Diamond, Stoned)
- [x] Chunk Schuldiner (Skeletal, Oceanic, Diamond, Stoned)
- [x] Emo Chuck (Skeletal, Oceanic, Diamond, Stoned)
- [x] Heave Tucker (Skeletal, Oceanic, Diamond, Stoned)
- [x] Scrawny Ronnie (Skeletal, Oceanic, Diamond, Stoned)
- [x] Ronstrocity (Skeletal, Oceanic, Diamond, Stoned)
- [x] Fartin Van Drunen (Skeletal, Oceanic, Diamond, Stoned)
- [x] Martin Van Druid (Skeletal, Oceanic, Diamond, Stoned)
- [x] Beers n Steers (Skeletal, Oceanic, Diamond, Stoned)
- [x] Hillbilly Steer (Skeletal, Oceanic, Diamond, Stoned)
- [x] Tank Mullen (Skeletal, Oceanic, Diamond, Stoned)
- [x] Frank Mullet (Skeletal, Oceanic, Diamond, Stoned)

**Total: 16/16 characters complete = 64 variants + 16 base = 80 Series 4 cards**

## Known Limitations
- Render free tier sleeps after 15 mins inactivity (30 sec wake-up time)
- Card flip animations removed (EAS build compatibility)
- EAS Build quota exhausted until ~May 1, 2026

## Backlog

### P0 - Immediate
- [x] Complete Series 4 variants (ALL 16/16 DONE!)
- [ ] Series 5 base cards + variants (awaiting user uploads)

### P1 - High Priority
- [x] Google Play Billing integration (react-native-iap + backend verification)
- [ ] EAS Build Version 15 (after quota reset ~May 1)
- [ ] Configure Google Play Console products (thrash_kan_kidz_coins_200/500/1000)
- [ ] Restore card flip animations in Collection view

### P2 - Medium Priority
- [ ] User-to-user card trading feature
- [ ] Refactor `server.py` into route modules
- [ ] BuyCoinsModal scrolling fix

### P3 - Future
- [ ] Upgrade Render to paid tier for always-on
- [ ] iOS App Store submission
- [ ] Push notifications for daily rewards
