# Tech News App

A cross-platform React Native app for browsing, saving, and filtering the latest technology news. No sign ups, or emails required.

## Features

- **Browse Tech News:** View curated articles from multiple sources.
- **Save Articles:** Bookmark articles for later reading.
- **Animated UI:** Smooth transitions and modals for enhanced user experience.
- **Offline Support:** Articles are cached locally using SQLite.
- **Custom Navigation:** Bottom navigation bar for quick access.

## Technologies

- **React + React Native**
- **SQLite**
- **Animated & Reanimated**
- **TypeScript**
- **PostgreSQL**
- **Node**
- **Express**

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the Expo server:**
   ```bash
   npx expo start
   ```
3. **Run on device or emulator:**
   - Scan the QR code with Expo Go, or
   - Press `i` for iOS simulator, `a` for Android emulator.

## Project Structure

```
src/
  app/
    components/
      news_card.tsx      # News card UI & logic
      navigation.tsx     # Bottom navigation bar
      styling.tsx        # Gradient text, horizontal line
    homepage.tsx         # Main screen logic

  server/
    newsapi.ts           # Article types
    src/
      index.ts           # Backend server, nodejs + express
    db.ts                # contains the db context definition
    models.ts            # contains db schema models
    newsapi.ts           # the main API for fetching initial articles

```

## Server

The backend is written uing TypeScript in conjunction with Node.js and Express, writing my APIs using REST. In addition, I make use of the library `pg-promise`, so thanks to those developers for creating truly simple but yet still interactive.
