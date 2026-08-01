function parseLatLong(latLongString) {
    if (!latLongString) return null;
    const lat = parseFloat(latLongString.split(',')[0].split(':')[1]);
    const lon = parseFloat(latLongString.split(',')[1].split(':')[1]);
    return { lat, lon };
}

export async function getParkWeather(latLongString) {
    const coords = parseLatLong(latLongString);
    if (!coords) return null;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,weathercode&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=7`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}`);
        const data = await response.json();
        // Debug log to inspect raw response structure
        console.log("weather data:", data);
        return data;
    } catch (error) {
        console.error("Could not fetch weather data:", error);
        return null;
    }
}
