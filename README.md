# cp
Park Planner 

Park Planner is an interactive web application designed to help outdoor enthusiasts search for U.S. National Parks by state and activity, view details, check current weather forecasts, and organize saved trips.

Live Demo & Video Presentation
Live Site: [Link to your hosted site, e.g., GitHub Pages / Netlify]

Loom Video Walkthrough: [Link to your 5-minute Loom video]

Features & Technical Highlights
1. External API Integration
National Park Service (NPS) API (developer.nps.gov):

Fetches park details, state mappings, entrance fees, address information, and park images (/parks).

Retrieves real-time alerts (/alerts) categorized by severity level (caution, information, park-closure, danger).

Retrieves additional things to do (/thingstodo) for each park where available.

Open-Meteo Weather API (open-meteo.com):

Fetches 7-day daily weather forecasts (high/low temps, precipitation probability, max wind speeds, weather code icons) using latitude/longitude coordinates extracted from park data.

2. Dynamic Features & Custom Logic
Custom Weather Assessment Algorithm: Analyzes 7-day weather metrics against specific activity safety parameters (temperature extremes, precipitation, and high winds) to generate dynamic condition status badges (Good, Fair, or Challenging).

Local Storage Persistence: Selected parks and search parameters (activity tags, park metadata) are stored in localStorage (selectedPark-ls) to maintain state across pages and sessions.

Responsive UI & Interactive Modals: Dynamic dialog modals for detailed park views and interactive removal mechanisms for saved itineraries.

Built With:
HTML5 & CSS3: Semantic markup, CSS Grid/Flexbox layouts, CSS keyframe animations, transitions, backdrop filters, and custom CSS variables (:root).

JavaScript (ES Modules): Clean separation of concerns across modules (api.mjs, open-meteo-api.mjs, ui.mjs, plan.mjs).

Local Storage API: Client-side persistence for saved trips.

Project Structure:
Plaintext
├── index.html / search.html   # Park search interface and filtering
├── plan.html                  # Trip itinerary, park summary, alerts, and 7-day weather forecast
├── styles/
│   └── small.css             # Main stylesheet (responsive design, animations, CSS Grid)
|   └── larger.css             # Larger display stylesheet
└── scripts/
    ├── api.mjs                # NPS API fetching and data transformations
    ├── open-meteo-api.mjs     # Open-Meteo API fetching and coordinate formatting
    ├── ui.mjs                 # UI helper functions, modal management, and search rendering
    ├── plan.mjs               # Itinerary building, alert handling, and weather condition logic
    ├── navigation.js          # Hamburger menu toggle and responsive navigation
    └── dates.js               # Last modified date for the footer

ESLint & Quality Standards
Formatted according to standard JavaScript ES6+ specifications.

Zero syntax, unused variable, or structural ESLint errors.

Accessible HTML markup including ARIA labels, semantic landmark elements, and image alternative text.