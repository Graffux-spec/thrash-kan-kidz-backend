# Thrash Kan Kidz - Product Requirements Document

## Original Problem Statement
Build a mobile card collecting app for "Thrash Kan Kidz" cards where users:
- Log in to receive coins
- **Spin a roulette wheel** to get random cards (gacha system)
- View their collection (showing owned vs missing cards)
- Trade duplicate cards with other users
- Unlock special cards through achievements and milestones
- Buy coins with real money (Stripe integration)

## Core Features

### Series System (NEW - March 2026)
Cards are organized into series. Users must complete one series before accessing the next:
- **Series 1**: 16 cards (8 bands × 2 cards each: A & B)
- **Series 2-4**: Future series (same structure)
- Completing a series unlocks:
  - A **Rare card reward**
  - Access to the **next series**

**Series 1 Bands:**
| Band | Card A | Card B |
|------|--------|--------|
| Mille | Silly Mille | Mille Gorezza |
| Cliff | Cliff Burpin | Cliff Diver |
| Scott | Scotch Ian | Scott Eaten |
| Chuck | Chuck Roast | Blood Bonder |
| Tom | Tom da Playa | Billy Chuck |
| Don | Don Doody | Tommy Spewart |
| Beer | Beer Schmier | Philled Up |
| Piggy | Piggy in a Blanket | Billy Mylanta |

**Series Rewards:**
- Series 1 → Martin Van Druid (Rare)
- Series 2 → Tardy Donald (Rare)
- Series 3 → Kerry The King (Rare)
- Series 4 → Jeff Possess Ya (Rare)

### Card Spinner (Gacha System)
Users spin a roulette wheel to randomly win cards from their current series:
- **Spin Cost**: 50 coins per spin
- **Duplicates**: Added to collection for trading
- **Visual**: Animated wheel with card previews, progress bar, series info

### Other Card Types (Goal Rewards)
- **Epic Cards**: 7-day streak (Tom Angeltipper), 14-day streak (Tom Angelflipper)
- **Engagement Cards**: 30-day streak (Maxi Pad), 750 coins spent (Musty Dave), 20 days/month (Chum Araya)

### Coin Purchase System (Implemented Feb 27, 2026)
Users can purchase coins with real money via Stripe:
| Package | Base Coins | Price | Coins/$ |
|---------|-----------|-------|---------|
| Starter Pack | 200 | $1.99 | ~100 |
| Collector Pack | 500 | $4.99 | ~100 |
| Ultimate Pack | 1000 | $9.99 | ~100 |

**First Purchase Bonus:** New users get **50% extra coins** on their first purchase!
- Starter: 200 + 100 bonus = 300 coins
- Collector: 500 + 250 bonus = 750 coins  
- Ultimate: 1000 + 500 bonus = 1500 coins

Features:
- Stripe Checkout integration for secure payments
- First-purchase bonus (50% extra coins)
- "Best Value" indicator on Ultimate Pack
- Coins per dollar display for savings comparison
- Payment transaction history tracking
- Automatic coin crediting after successful payment
- Webhook support for payment confirmations
- IAP structure prepared for future iOS/Android native purchases

### Goals System
- First Card: Collect first card (25 coins)
- Card Enthusiast: Collect 1 of each rarity (150 coins)
- Thrash Master: Collect 50 cards (250 coins)
- Streak Starter: 3-day login streak (50 coins)
- Dedicated Fan: 7-day streak (100 coins)
- Coin Collector: Collect 100 coins (25 coins)

## Technical Architecture

### Backend (FastAPI)
- `/app/backend/server.py` - Main server with all API endpoints
- MongoDB database with collections: users, cards, user_cards, goals

### Frontend (Expo/React Native)
- `/app/frontend/app/` - Main app screens
  - `index.tsx` - Home/Login screen
  - `shop.tsx` - Card shop with all tier sections
  - `collection.tsx` - User's card collection
  - `goals/index.tsx` - Goals and achievements
  - `profile/index.tsx` - User profile
  - `trade.tsx` - Card trading

### Key API Endpoints
- `POST /api/users` - Create user
- `GET /api/users/{user_id}` - Get user data
- `POST /api/users/{user_id}/daily-login` - Claim daily bonus
- `POST /api/users/{user_id}/purchase-card` - Buy a card
- `GET /api/users/{user_id}/check-rare-cards` - Check rare card unlock status
- `GET /api/users/{user_id}/check-epic-cards` - Check epic card unlock status
- `GET /api/users/{user_id}/check-engagement-milestones` - Check engagement milestone status (NEW)
- `GET /api/users/{user_id}/goals` - Get user's goal progress

## Database Schema

### Users Collection
```json
{
  "id": "uuid",
  "username": "string",
  "coins": "int",
  "daily_login_streak": "int",
  "last_login_date": "string (YYYY-MM-DD)",
  "total_spent_coins": "int",
  "monthly_logins": {"YYYY-MM": [day1, day2, ...]},
  "unlocked_rare_cards": ["card_id", ...],
  "unlocked_epic_cards": ["card_id", ...],
  "unlocked_engagement_cards": ["card_id", ...]
}
```

### Cards Collection
```json
{
  "id": "card_xxx",
  "name": "string",
  "description": "string",
  "rarity": "common|rare|epic",
  "front_image_url": "string",
  "back_image_url": "string",
  "coin_cost": "int",
  "available": "bool",
  "achievement_required": "int|null",
  "streak_required": "int|null",
  "engagement_milestone": "dedicated_fan|big_spender|monthly_master|null"
}
```

## What's Been Implemented

### February 20, 2026
- ✅ **Engagement Milestones Feature**
  - Added tracking for `total_spent_coins` and `monthly_logins` in user model
  - Created 3 engagement milestone cards (Maxi Pad, Musty Dave, Chum Araya)
  - Added `check_engagement_milestones` function for automatic unlocking
  - Added `/api/users/{user_id}/check-engagement-milestones` endpoint
  - Updated purchase endpoint to track spending
  - Updated daily login to track monthly logins
  - Added Engagement Milestones section UI in shop.tsx

### Previous Sessions
- Full card shop with Common, Rare, Epic, Coming Soon sections
- Collection view with card flip animation
- Goals system with coin rewards
- Daily login bonus with streak tracking
- Tab navigation (Home, Collection, Shop, Goals, Trade, Profile)
- Custom logo and background theming

## Pending Issues
1. (P2) Cliff Diver card image may appear missing - likely mobile caching issue
2. (P3) Web preview scrolling can be unreliable

## Upcoming Tasks
- App store submission process (binary build, App Store Connect setup)

## Future/Backlog
- Add In-App Purchases (IAP) for iOS/Android native checkout
- Purchase receipts/confirmation emails
- Refactor server.py into separate route/model files
- Refactor shop.tsx into smaller components
- Improve database seeding logic

## Recently Completed (March 2026)
- ✅ Privacy Policy screen (`/app/frontend/app/privacy.tsx`)
- ✅ Profile screen enhancements:
  - Buy Coins quick action with cart icon
  - Payment History viewer with receipt icon
  - Privacy Policy link with shield icon at bottom
  - Improved logout button with Ionicons
