# clipchain

A web application that allows users to save and play video clips by selecting time intervals within videos and grouping them into shareable collections.

## Technologies

- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **JavaScript** (no TypeScript)

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Header.jsx      # Header with navigation
├── pages/              # Main views
│   └── Home.jsx        # Home page
├── lib/                # Helper logic
│   └── urlParser.js    # URL parsing utilities
├── data/               # Mock data
│   └── mockData.js     # Example data
├── App.jsx             # Main component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Features

- ✅ Navigation with React Router
- ✅ Responsive design with Tailwind CSS
- ✅ Scalable folder structure
- ✅ Reusable components
- ✅ YouTube URL parsing utilities
- ✅ Mock data for development

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the production build
- `npm run lint` - Runs the linter

## Upcoming Features

- [ ] Clip creation with time selection
- [ ] Collection management
- [ ] Clip playback
- [ ] User system
- [ ] Share collections
