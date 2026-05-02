// netlify/functions/google-maps.js
// Proxy for Google Maps Directions & Distance Matrix API
// Your key stays server-side — never exposed to the browser

exports.handler = async (event) => {
  const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Google Maps API key not configured" }),
    };
  }

  const {
    type = "directions",
    origin,
    destination,
    alternatives = "true",
    mode = "driving",
    departure_time = "now",
  } = event.queryStringParameters || {};

  // Default: Home (Kingston) → Work (New Kingston)
  const org  = origin      || "17.9970,-76.7936";
  const dest = destination || "18.0100,-76.7890";

  let url = "";

  if (type === "directions") {
    url = `https://maps.googleapis.com/maps/api/directions/json?origin=${org}&destination=${dest}&alternatives=${alternatives}&mode=${mode}&departure_time=${departure_time}&traffic_model=best_guess&key=${GOOGLE_KEY}`;
  } else if (type === "distancematrix") {
    // Returns travel time with traffic for multiple origins/destinations
    url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${org}&destinations=${dest}&mode=${mode}&departure_time=${departure_time}&traffic_model=best_guess&key=${GOOGLE_KEY}`;
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unknown type. Use: directions | distancematrix" }),
    };
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Google Maps API request failed", detail: err.message }),
    };
  }
};
