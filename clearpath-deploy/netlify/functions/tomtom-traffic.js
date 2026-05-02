// netlify/functions/tomtom-traffic.js
// Proxy for TomTom Flow & Incidents API
// Your key stays server-side — never exposed to the browser

exports.handler = async (event) => {
  const TOMTOM_KEY = process.env.TOMTOM_API_KEY;

  if (!TOMTOM_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "TomTom API key not configured" }),
    };
  }

  const { type = "flow", bbox } = event.queryStringParameters || {};

  // bbox format: "minLon,minLat,maxLon,maxLat"
  // Kingston, Jamaica default bounding box
  const boundingBox = bbox || "-76.85,17.95,-76.75,18.05";

  let url = "";

  if (type === "flow") {
    // TomTom Traffic Flow Segment Data
    const [minLon, minLat, maxLon, maxLat] = boundingBox.split(",");
    const centerLat = ((parseFloat(minLat) + parseFloat(maxLat)) / 2).toFixed(5);
    const centerLon = ((parseFloat(minLon) + parseFloat(maxLon)) / 2).toFixed(5);
    url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${centerLat},${centerLon}&key=${TOMTOM_KEY}`;
  } else if (type === "incidents") {
    // TomTom Traffic Incidents
    url = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${boundingBox}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}&language=en-GB&t=1111&key=${TOMTOM_KEY}`;
  } else if (type === "route") {
    // TomTom Routing — expects origin & destination params
    const { origin, destination } = event.queryStringParameters;
    if (!origin || !destination) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "origin and destination required for route type" }),
      };
    }
    url = `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?traffic=true&travelMode=car&key=${TOMTOM_KEY}`;
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unknown type. Use: flow | incidents | route" }),
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
      body: JSON.stringify({ error: "TomTom API request failed", detail: err.message }),
    };
  }
};
