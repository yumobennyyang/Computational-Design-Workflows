/*
 * MAPBOX TUTORIAL: Interactive New York City Map
 * ===============================================
 * 
 * This script demonstrates how to create an interactive map using Mapbox GL JS.
 * It's designed for beginners learning both JavaScript and Mapbox.
 * 
 * WHAT IS MAPBOX?
 * Mapbox is a mapping platform that provides tools to create custom maps.
 * Mapbox GL JS is a JavaScript library that renders interactive maps in web browsers.
 * 
 * PREREQUISITES:
 * - Basic understanding of HTML, CSS, and JavaScript
 * - A Mapbox access token (free at https://account.mapbox.com/access-tokens/)
 * - Mapbox GL JS library loaded in your HTML
 */

// Wrap everything in a function to maintain independence from other scripts
var mapboxSketch = function () {
    // ============================================================================
    // STEP 1: SET UP YOUR MAPBOX ACCESS TOKEN
    // ============================================================================
    // An access token is like a password that lets you use Mapbox services.
    // You need to get a free token from Mapbox's website.
    // Replace this with your own token!
    mapboxgl.accessToken = 'pk.eyJ1IjoieXkzMjA0IiwiYSI6ImNtZGMxbWVvcDB5NjcyaXB1dzdmMGVtdmoifQ.RGa59Rq3emWACakc-RHJOg'; // Replace with your own token <---------------------------------------------------------------------------------------------

    // ============================================================================
    // STEP 2: CREATE THE MAP OBJECT
    // ============================================================================
    // The 'new' keyword creates a new instance of the Mapbox Map class.
    // This is like creating a new object that represents your map.
    const map = new mapboxgl.Map({
        // 'container' tells Mapbox which HTML element to put the map in
        // This should match the 'id' of a div in your HTML
        container: 'mapbox-container-1',

        // 'style' determines how your map looks
        // Mapbox provides several pre-made styles:
        // - 'light-v11': Clean, minimal style (what we're using)
        // - 'streets-v12': Standard street map
        // - 'satellite-v9': Satellite imagery
        // - 'dark-v11': Dark theme
        style: 'mapbox://styles/yy3204/cmdc97tnq00a501s29w91a0fw',

        // 'center' sets where the map is centered when it first loads
        // Format: [longitude, latitude] (note: longitude comes first!)
        // These coordinates are for New York City
        center: [-74.006, 40.7128],

        // 'zoom' sets how close or far the map is zoomed
        // Higher numbers = more zoomed in (closer to the ground)
        // Typical range: 0 (world view) to 22 (building level)
        zoom: 11,

        // 'pitch' tilts the map for a 3D effect
        // 0 = flat (top-down view), 60 = maximum tilt
        // We're using 0 for a clean, minimal look
        pitch: 0,

        // 'bearing' rotates the map
        // 0 = north at the top, 90 = east at the top, etc.
        bearing: 0
    });




    // ============================================================================
    // STEP 3: ADD MAP CONTROLS
    // ============================================================================
    // Controls are UI elements that let users interact with the map

    // Navigation control: adds zoom in/out buttons and a compass
    // 'top-right' positions it in the top-right corner of the map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Fullscreen control: adds a button to make the map fullscreen
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Scale control: shows the map scale (how many meters/pixels)
    // This helps users understand distances on the map
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,        // Maximum width of the scale bara
        unit: 'metric'       // Use meters/kilometers instead of feet/miles
    }), 'bottom-left');


    map.on('load', () => {
        console.log('Map loaded successfully!');

        fetch("public/noise_complaints.geojson")
            .then((response) => {
                console.log("Fetched:", response);
                if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
                return response.text(); // TEMP: read as text to debug
            })

            .then((data) => {
                const rawNoiseData = data.features.filter(f => f.geometry);

                // Step 1: Count complaints per 30-min interval (48 buckets)
                let intervalCounts = new Array(48).fill(0);
                for (const f of rawNoiseData) {
                    const t = parseDate(f.properties.created_date);
                    if (t) {
                        const interval = t.getHours() * 2 + Math.floor(t.getMinutes() / 30);
                        intervalCounts[interval]++;
                    }
                }
                const maxIntervalCount = Math.max(...intervalCounts);

                // Step 2: Add source and layer
                map.addSource("noise-data", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: [],
                    },
                });

                map.addLayer({
                    id: "noise-heatmap",
                    type: "heatmap",
                    source: "noise-data",
                    paint: {
                        "heatmap-weight": ["get", "weight"],
                        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 3],
                        "heatmap-color": [
                            "interpolate", ["linear"], ["heatmap-density"],
                            0, "rgba(255,255,0,0)",
                            0.2, "rgba(255,255,0,0.5)",
                            0.4, "orange",
                            0.6, "orangered",
                            0.8, "red",
                            1, "darkred"
                        ],
                        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 15, 16, 40],
                        "heatmap-opacity": 0.8
                    },
                });

                // Step 3: Initial heatmap
                updateHeatmap(24); // noon

                // Step 4: Time slider event
                document.getElementById("timeSlider").addEventListener("input", (e) => {
                    updateHeatmap(parseInt(e.target.value));
                });

                // Step 5: Heatmap update function
                function updateHeatmap(interval) {
                    const hour = Math.floor(interval / 2);
                    const minute = interval % 2 === 0 ? "00" : "30";
                    const ampm = hour < 12 ? "AM" : "PM";
                    const labelHour = hour % 12 === 0 ? 12 : hour % 12;
                    document.getElementById("timeLabel").textContent = `${labelHour}:${minute} ${ampm}`;

                    const now = new Date("2025-07-20");

                    const filtered = rawNoiseData
                        .map(f => {
                            const ts = parseDate(f.properties.created_date);
                            if (!ts) return null;
                            const tsInterval = ts.getHours() * 2 + Math.floor(ts.getMinutes() / 30);
                            if (tsInterval !== interval) return null;

                            const ageDays = (now - ts) / (1000 * 60 * 60 * 24);
                            const recencyWeight = 1 / (1 + ageDays);
                            const timeWeight = maxIntervalCount / intervalCounts[interval];

                            f.properties.weight = recencyWeight * timeWeight;
                            return f;
                        })
                        .filter(Boolean);

                    map.getSource("noise-data").setData({
                        type: "FeatureCollection",
                        features: filtered
                    });
                }

                function parseDate(dateStr) {
                    // Parses "2025 Jul 19 01:48:33 AM"
                    return new Date(Date.parse(dateStr.replace(/(\d{4} \w{3} \d{2}) (\d{2}:\d{2}:\d{2}) (AM|PM)/, "$1T$2 $3")));
                }
            })
            .catch((err) => {
                console.error("❌ Failed to load GeoJSON:", err);
            });
    });



    console.log('Mapbox NYC Map initialized');
    console.log('Available map styles:');
    console.log('- mapbox://styles/mapbox/light-v11 (current)');
    console.log('- mapbox://styles/mapbox/streets-v12');
    console.log('- mapbox://styles/mapbox/satellite-v9');
    console.log('- mapbox://styles/mapbox/dark-v11');
    console.log('- mapbox://styles/mapbox/outdoors-v12');

};

// Execute the sketch
mapboxSketch(); 