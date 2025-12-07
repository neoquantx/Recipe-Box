# RecipeBox - React Native (Expo)

## Features
- View, search, add, and favorite recipes
- Persistent storage via AsyncStorage
- Simple, clean UI

## Run
1. `npm install`
2. `expo start`
 
## Environment variables & secrets
Keep production keys out of the repository. Copy `.env.example` to `.env` and fill in your Firebase configuration values locally (do not commit `.env`).

Example (macOS / Linux):
```
cp .env.example .env
# edit .env to fill in values
```

Expo/EAS: For managed builds, set these variables in EAS/your CI environment rather than committing them to the repo. `app.config.js` will read them at build-time.

## Structure
- `src/screens` - screens
- `src/components` - small components
- `src/storage` - AsyncStorage helpers
- `src/data/sampleRecipes.js` - initial sample data

## Notes
- Tested on Expo Go (iOS/Android)
