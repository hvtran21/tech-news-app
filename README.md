# Tech News App

A cross-platform React Native app for browsing, saving, and filtering the latest technology news. None of your personal info required.

---

## Frontend Features

- **Browse Tech News:** View curated articles from multiple sources based on user-selected genres and categories.
- **Filter & Personalize:** Users can select and save preferred genres (AI, ML, Apple, Microsoft, Amazon, Gaming, Cybersecurity, Game Development, Nintendo).
- **Save Articles:** Bookmark articles for later reading with instant save/unsave actions.
- **Offline Support:** Articles are cached locally using SQLite, enabling offline reading.
- **Animated UI:** Smooth transitions, filter modals, fade-in effects, and animated menu options for enhanced user experience.
- **Custom Navigation:** Bottom navigation bar for quick access to Home, Recent, and Top articles.
- **Article Modal:** Tap ellipsis for modal options (open in browser, save/unsave, report).
- **Refresh Control:** Pull-to-refresh on article lists, which also triggers cleanup of old cached articles.
- **Font Management:** Uses custom fonts for improved aesthetics and readability.
- **First Launch Flow:** Smart routing between welcome page (genre selection) and homepage depending on first app launch.

## Backend (Server) Features

- **RESTful API:** Built with Node.js, Express, and TypeScript.
- **Database:** Uses PostgreSQL via `pg-promise` for robust article storage and querying.
- **Article Fetching:** Aggregates articles from NewsAPI, mapped to internal genres and categories.
- **Batch Insert & Deduplication:** Efficient batch insertion with conflict checks to avoid duplicate articles.
- **Endpoints:**
  - `/api/RemoveOldArticles`: Deletes articles older than a set threshold.
  - `/api/FetchArticles`: Triggers fetching and updating of articles from NewsAPI.
  - `/api/GetArticles`: Returns articles by user genre or category selection, with limit.
- **Initialization:** On startup, initializes the database schema and fetches articles for all genres and categories.
- **Error Handling:** Graceful error reporting and logging for API failures, database issues, and rate limits.
- **Article Schema:** Ensures uniqueness on (url, title), with support for genre, category, source, author, and all major metadata.

## Technologies

- **React + React Native**
- **Expo**
- **SQLite (Mobile)**
- **Animated & Reanimated**
- **TypeScript**
- **PostgreSQL (Server)**
- **Node.js**
- **Express**
- **pg-promise**
- **NewsAPI** (external source)

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

### Backend Server

1. **Install server dependencies:**
   ```bash
   cd src/server
   npm install
   ```
2. **Start the server (from project root):**
   ```bash
   ./src/start-server.sh
   ```
3. **Configure environment variables:**
   - Create a `.env` file in `src/server` with your NewsAPI key and database credentials.

## Project Structure

```
src/
  app/
    components/
      news_card.tsx        # News card UI & logic
      navigation.tsx       # Bottom navigation bar
      services.tsx         # Article fetching logic, local DB handling
      constants.tsx        # Article types and constants
      styles.tsx           # Gradient text, horizontal line styles

    homepage.tsx           # Main screen: article list, filters, modal logic
    welcome.tsx            # First time genre selection & DB initialization
    _layout.tsx            # Navigation stack configuration
    index.tsx              # App entry, font loading, initial routing

  server/
    db.ts                  # DB context definition
    models.ts              # DB schema models
    newsapi.ts             # Main API for fetching and saving articles
    constants.ts           # Genre/category mappings
    src/
      index.ts             # Express server, API endpoints

  start-server.sh          # Script to build and start backend server
  eslint.config.js         # ESLint configuration

.env                       # Environment variables (NewsAPI key, etc.)
```

## Server Details

The backend is written using TypeScript, Node.js, and Express, exposing REST APIs to the frontend. It uses `pg-promise` for PostgreSQL integration, enabling efficient, batched article storage and retrieval. Articles are fetched from NewsAPI, mapped into internal genres/categories, and returned based on user preferences.

---

Feel free to further expand sections as the project grows!
