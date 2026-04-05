# Thrash Kan Kidz - Product Requirements Document

## Overview
A mobile card collecting app featuring thrash/death metal parody cards. Users collect cards through a shop spinner, complete series to unlock rewards, and trade variants.

## Core Features
- Card pack opening (spinner) for 50 coins
- Series-based progression (Series 1, 2, 3, 4+)
- Variant trade-in system (5 duplicates for 1 variant)
- In-app purchases for coins
- Collection view with mystery cards for uncollected items
- Password authentication

## What's Been Implemented

### April 4, 2026
- Fixed tab bar overlapping Android navigation buttons (paddingBottom: 48px)
- Fixed Collection screen crash (replaced FlashList with FlatList)
- Added 64 Series 3 variants to database:
  - Variant themes: Organic, Metal, Steampunk, Glitched
  - All 16 base cards × 4 variants each
  - Universal back images for each variant type
- Implemented password authentication:
  - /api/auth/register - Create account with password
  - /api/auth/login - Login with username/password
  - bcrypt password hashing
- Updated Collection view:
  - ALL cards show as mystery cards until collected
  - No names visible for uncollected cards
  - Reward/accomplishment cards also hidden until earned
- Built AAB Version 9 for Google Play

### Previous Sessions
- Series 1: 16 common cards + Kerry The King (rare reward) + 64 variants
- Series 2: 16 common cards + Strap-On Taylor (rare reward) + 64 variants  
- Series 3: 16 common cards + Sean Kill-Again (epic reward) + 64 variants
- Series 4: 16 common cards added (Death Metal Edition) - NO variants yet
- Tab bar cleanup (hidden utility screens)
- Card flip functionality in collection modal
- Daily login rewards system
- Stripe payment integration (needs migration to Google Play Billing)

## Database Schema
- **users**: id, username, password_hash, coins, unlocked_series, completed_series
- **cards**: id, name, series, band, card_type, rarity, front_image_url, back_image_url, is_variant, base_card_id
- **user_cards**: user_id, card_id, quantity

## Current Card Count
- Total: 260 cards
- Series 1: 16 common + 1 rare + 64 variants = 81
- Series 2: 16 common + 1 rare + 64 variants = 81
- Series 3: 16 common + 1 epic + 64 variants = 81
- Series 4: 16 common (NO reward or variants yet) = 16

## Pending Tasks

### P0 - Critical
- Deploy backend permanently (Railway/Render) - preview URL dies between sessions
- Google Play Billing integration (replace Stripe for Android)

### P1 - High Priority  
- Series 4 variants (user to provide artwork)
- Series 4 reward card (user to provide artwork)
- Legacy user password migration (existing users have no password)

### P2 - Medium Priority
- Refactor server.py into modules (/routes, /models, /services)
- Series 5 cards (user mentioned half done)
- User-to-user trading feature

### P3 - Future
- Screenshot prevention (expo-screen-capture has compatibility issues)
- iOS build and App Store submission
- Push notifications

## Technical Stack
- Frontend: React Native (Expo), Expo Router
- Backend: FastAPI, PyMongo
- Database: MongoDB
- Build: EAS Build
- Distribution: Google Play Console (Internal Testing)

## Test Accounts
- Graffux, MetalFan, TestUser999 (legacy - no passwords)
- testuser2 (has password: test123)

## Key URLs
- Internal Testing: https://play.google.com/apps/internaltest/4701263672225145139
- Latest AAB (v9): https://expo.dev/artifacts/eas/hE71hG6FSFhvfiQf9n7GH7.aab
