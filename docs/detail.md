# 🌐 Project Specification: MatrixMonitor - Live Global DDoS Attack Map & Threat Intelligence Dashboard

This document breaks down the entire MatrixMonitor project from a high-level system design perspective down to the granular implementation details. It is designed to act as your primary reference guide, architectural blueprint, and presentation script when you are ready to show this off to the world.

---

## 💡 Executive Summary

**MatrixMonitor** is an event-driven, full-stack application that visualizes cyber threats in real-time while doubling as a historical threat intelligence dashboard.

It ingests global attack data, processes it through a machine learning anomaly detection engine to score the threat level, geolocates the attackers and victims, and streams this data via **Server-Sent Events (SSE)** to an interactive 3D frontend. By persisting all verified threat data into a relational database, users can not only watch attacks as they happen but also query and visualize past DDoS campaigns.

---

## 🏗️ System Architecture Deep Dive

This application uses a unidirectional data flow optimized for real-time web communication and historical data retrieval, completely contained within a single unified solution architecture.

1. **The Polling Service:** A background worker continuously polls threat intelligence feeds (like AbuseIPDB).
2. **The ML Filter:** Raw IP data is fed into an ML.NET pipeline. The model evaluates the frequency and pattern of the incoming IPs and assigns a confidence score, discarding anomalies that don't meet the threshold of a true DDoS attack.
3. **Geolocation Enrichment:** Verified IPs are mapped to physical coordinates (Latitude/Longitude) using the MaxMind GeoIP2 database.
4. **Data Persistence:** The enriched data payload is immediately saved to a PostgreSQL database using Entity Framework Core. This serves as the system of record for the "Past Attacks" feature.
5. **Real-Time Broadcast (SSE):** Simultaneously, the payload is pushed through a unidirectional Server-Sent Events (SSE) stream to all connected clients.
6. **Macro Intel:** A separate background task queries the Cloudflare Radar API to fetch broader internet traffic trends to provide context against your local data.
7. **The Client:** The browser manages two data flows: it fetches historical data on load to populate past attacks, and it listens to the SSE stream to update the React state and plot live attack vectors on a 3D WebGL globe.

---

## 🛠️ Technology Stack Breakdown

The tech stack is selected to prioritize performance, strong typing, and visual impact.

- **Backend & Streaming Engine:** **ASP.NET Core Web API (C#) & Server-Sent Events (SSE)**. .NET excels at background task processing (`BackgroundService`). Using SSE provides a lightweight, standard HTTP-based mechanism for the server to push live updates to the client without the overhead of full WebSockets.
- **Machine Learning:** **ML.NET**. This allows the anomaly detection model to run natively within the C# ecosystem. We will use the `DetectIidSpike` transform to identify sudden spikes in malicious traffic.
- **Database:** **PostgreSQL via Entity Framework Core**. A robust relational database is perfect for logging the structured attack data and running analytical queries so users can explore past attack windows.
- **Frontend:** **React.js (TypeScript) & `react-globe.gl**`. React handles the complex state merging of historical database records and the high-frequency SSE live stream, while the globe library handles the heavy WebGL rendering.

---

## 🚀 Core Features & Implementation Strategy

### 1. The Machine Learning Threat Filter

To prevent the map from just plotting random spam bots, the system uses ML.NET for anomaly detection.

- **Implementation Idea:** Train a model using `MLContext` and apply the `DetectIidSpike` algorithm.
- **How it works:** As IP addresses stream in, the algorithm looks at the historical sliding window of data. If an IP suddenly spikes in activity beyond a high confidence threshold, it is flagged as a legitimate DDoS vector.

### 2. Live 3D Data Visualization

This is the visual centerpiece of MatrixMonitor.

- **Implementation Idea:** The React frontend maintains a state array of `attacks`. Every time the SSE connection receives a new attack payload, it is appended to this array.
- **How it works:** `<Globe arcsData={attacks} ... />` automatically draws a glowing line from the attacker's coordinates to the victim's coordinates.

### 3. Historical Analytics & Time Travel

A real-time map is cool, but historical context makes it a true security tool.

- **Implementation Idea:** Create a unified REST endpoint that queries PostgreSQL for specific time blocks alongside the live SSE stream.
- **How it works:** Users can view charts in a sidebar detailing past attack volume, or use a "Time Machine" slider to pause the live stream and replay attacks from a specific timeframe in the past.

### 4. Interactive Gamification

This feature turns the map from a passive video into an interactive experience.

- **Implementation Idea:** Utilize the `onGlobeClick` or `onPolygonClick` events in `react-globe.gl`.
- **How it works:** When a massive attack arc hits a specific country, clicking that country allows the user to "Deploy Cloudflare Shield." This triggers a state change, turning incoming red arcs into blue arcs, simulating traffic mitigation.

---

## 🎬 The "Wow" Factor: Content Creation & Showcasing

This project is engineered to be highly shareable and visually striking. To maximize this, build a **Cinematic Content Mode**.

- Add a hotkey or a hidden UI toggle in React.
- When triggered, hide the entire DOM interface (sidebars, navbars, analytics charts).
- Apply a slow auto-rotation to the globe (`autoRotate={true}`).
- This leaves you with a clean, cinematic, edge-to-edge glowing 3D Earth actively rendering cyber attacks—perfect for screen recording a B-roll background while explaining the system design.

---

## 🏃‍♂️ Step-by-Step Execution Plan

**Sprint 1: The Core Pipeline & Persistence (.NET + SSE + DB)**

1. Initialize the monolithic ASP.NET Core solution.
2. Build the `BackgroundService` to poll the AbuseIPDB API.
3. Integrate MaxMind GeoIP2 to translate IPs into coordinates.
4. Set up PostgreSQL and Entity Framework Core within the solution.
5. Save verified attacks to the database as they are processed.
6. Set up the Server-Sent Events (SSE) endpoint to stream this data efficiently to clients via HTTP.

**Sprint 2: The Intelligence Layer (ML.NET)**

1. Add the necessary `Microsoft.ML` packages.
2. Train the `DetectIidSpike` model using a baseline dataset.
3. Inject the `MLContext` into your polling service to filter data before it gets stored or broadcasted.

**Sprint 3: The Visuals (React + Globe)**

1. Initialize the React/TypeScript frontend.
2. Connect the standard JavaScript `EventSource` API to listen to the .NET SSE stream.
3. Pass the live data into `react-globe.gl` to render the animated attack arcs.

**Sprint 4: Analytics API & Macro Intel**

1. Build the REST API endpoints to fetch past data blocks from PostgreSQL.
2. Build the React dashboard sidebar to merge this historical data with the live stream.
3. Integrate the Cloudflare Radar API for macro-level global baseline data.

**Sprint 5: Polish & Deployment**

1. Add the "Deploy Shield" interactivity and the Cinematic Content Mode.
2. Containerize the application components using Docker.
3. Deploy the database, the .NET backend, and the React frontend.
