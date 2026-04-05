# 🌐 Project Blueprint: Live Global DDoS Attack Map

## 💡 The Concept

A real-time, interactive 3D globe that visualizes global cyberattacks. It ingests live threat data, runs it through an ML.NET anomaly detection model to filter out false positives by assigning a "DDoS Confidence Score," geolocates the verified threats, and renders them as animated arcs on a digital Earth.

## 🛠️ The Tech Stack

- **Backend:** ASP.NET Core Web API (C#)
- **Real-Time Engine:** SignalR
- **Machine Learning:** ML.NET (Anomaly Detection / Threat Classification)
- **Database:** PostgreSQL (with Entity Framework Core)
- **Frontend:** React.js / TypeScript
- **3D Rendering:** `react-globe.gl` (Three.js wrapper)
- **External APIs:** AbuseIPDB (Micro IP data), Cloudflare Radar API (Macro trends), MaxMind GeoIP2 (Geolocation)

## 🏗️ System Architecture

1. **The Polling Engine:** A .NET `BackgroundService` continuously fetches recent attack IPs from AbuseIPDB.
2. **The ML Filter:** The raw data is passed into an ML.NET pre-trained model. The model analyzes the request patterns and network data to assign a "Confidence Score" (0% to 100%), effectively filtering out low-threat anomalies.
3. **Data Enrichment:** The high-confidence IPs are passed through MaxMind to get Lat/Long coordinates.
4. **The Pipeline:** The .NET worker saves the verified log to PostgreSQL for historical analysis and instantly broadcasts the live event to the React frontend via a SignalR WebSocket.
5. **Macro Intel:** A secondary .NET worker calls the Cloudflare Radar API every few hours to pull macro-level global DDoS statistics.
6. **The Visualizer:** React listens to the SignalR hub and maps the incoming coordinates to the 3D globe in real-time.

## 🚀 Feature Crunch (The "Wow" Factor)

- **AI-Driven Threat Scoring:** Built-in ML.NET engine that evaluates and scores incoming data to prevent false alarms, ensuring only highly probable attacks are rendered.
- **Real-Time 3D Visualization:** Cyber attacks rendered as glowing, animated arcs traveling across a 3D Earth.
- **Historical Analytics Dashboard:** A UI panel querying PostgreSQL to show data like "Top 10 Targeted Regions" and "Daily Attack Volume" compared against Cloudflare's global baseline.
- **Event-Driven Alerting:** Backend logic that fires off a Discord or Slack webhook if a massive coordinated DDoS spike hits a specific region.
- **Defensive Gamification:** Interactive UI where clicking a targeted country allows the user to "Deploy Cloudflare Shield," turning incoming attack lines from red to blue.
- **Cinematic Content Mode:** A UI toggle that strips away all dashboards, menus, and text. This leaves only the glowing, rotating globe—perfect for recording clean, high-quality screen captures.
- **Public Threat API:** A custom REST endpoint (`/api/v1/check-ip`) that allows external users to query your PostgreSQL database to see if an IP has been part of a recent attack.

## 🏃‍♂️ Sprint Roadmap

### Sprint 1: Foundation & Data Ingestion

- Set up ASP.NET Core Web API and SignalR Hub.
- Create a Cloudflare account and generate a Radar API token.
- Build the `BackgroundService` to poll AbuseIPDB for malicious IPs.
- Integrate MaxMind GeoIP2 to convert IPs to coordinates.

### Sprint 2: Machine Learning & Real-Time Filtering

- Install `Microsoft.ML` packages into the .NET project.
- Train a basic anomaly detection model using a historical dataset of normal vs. malicious traffic.
- Inject the ML.NET prediction engine into your background worker to score IPs before they are broadcasted.

### Sprint 3: Real-Time Visualization

- Initialize the React frontend and install `react-globe.gl`.
- Connect React to the .NET SignalR Hub.
- Map the live, ML-verified coordinate data to the `arcsData` and `pointsData` properties on the 3D globe.

### Sprint 4: Database Analytics & Cloudflare Integration

- Spin up PostgreSQL and configure Entity Framework Core.
- Update the .NET worker to save all verified attack logs to the database.
- Create a `CloudflareApiService` to fetch global DDoS trends from the Radar API and save them to Postgres.
- Build the React sidebar to display historical charts and Cloudflare comparisons.

### Sprint 5: Polish & Deployment

- Implement the Discord/Slack webhook alerting system.
- Add the "Deploy Shield" gamification and "Cinematic Mode" to the React frontend.
- Containerize the .NET backend and React frontend using Docker.
- Deploy PostgreSQL, the .NET API/SignalR server, and the React frontend to production environments.
