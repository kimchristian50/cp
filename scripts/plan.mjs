import { getSelectedParkData, getSavedParksData, getSelectedParkAlerts } from './api.mjs'
import { getParkWeather } from './open-mateo-api.mjs'

// define display locations
const parkSummary = document.querySelector("#parkSummary");
const listHere = document.querySelector("#listHere");
const current = document.querySelector(".current");
const forecast = document.querySelector(".forecast");
const forecastSummary = document.querySelector(".forecast-summary");

// build the list of saved parks
async function buildSavedList() {
    const parks = await getSavedParksData();
    listHere.innerHTML = '';  // clear before rebuilding

    if (parks.length === 0) {
        listHere.innerHTML = `<h4>No parks selected yet. <a href="search.html">Search for parks</a> to get started.</h4>`;
        return;
    }
    parks.forEach(park => {
        listHere.innerHTML += `
            <div class="saved-park-item" data-parkcode="${park.parkCode}">
                <p>${park.fullName} (${park.states})</p>
                <button class="remove-park" data-parkcode="${park.parkCode}">✕</button>
            </div>
        `;
    });
}

async function buildSummaryData(parkCode) {
    const parkData = await getSelectedParkData(parkCode);
    if (!parkData?.data?.[0]) return;

    const park = parkData.data[0];
    const imageUrl = park.images?.[0]?.url ?? '';
    const imageAlt = park.images?.[0]?.altText ?? park.fullName;
    const address = park.addresses?.[0];
    const fee = park.entranceFees?.[0];

    parkSummary.innerHTML = `
        <h2>${park.fullName}</h2>
        <img src="${imageUrl}" alt="${imageAlt}" width="300" height="210" loading="lazy">
        <h3>${address?.line1 ?? ''} ${address?.line2 ?? ''}, ${address?.city ?? ''} ${address?.stateCode ?? ''}</h3>
        <p>${park.description}</p>
        <a href="${park.url}" target="_blank">${park.url}</a>
    `;

    if (fee) {
        parkSummary.innerHTML += `
            <div class="fees">
                <h3>Entrance fee:</h3>
                <p>$${fee.cost} - ${fee.description}</p>
            </div>
        `;
    }

    const alertResponse = await getSelectedParkAlerts(parkCode);
    const parkAlerts = alertResponse?.data ?? [];

    parkSummary.innerHTML += `<div class="park-alerts-wrapper"><h3>Park Alerts:</h3>`;
    if (parkAlerts.length === 0) {
        parkSummary.innerHTML += `<p>No current alerts for this park.</p>`;
    } else {
        parkAlerts.forEach(alert => {
            const categoryId = alert.category.replaceAll(' ', '-').toLowerCase();
            parkSummary.innerHTML += `
                <div class="alerts ${categoryId}">
                    <h4>${alert.category}</h4>
                    <p>${alert.title}: ${alert.description}</p>
                    <a href="${alert.url}" target="_blank">${alert.url}</a>
                </div>
            `;
        });
    }
    parkSummary.innerHTML += `</div>`;

    // get latLong field and send to getParkWeather
    const latLong = park.latLong;
    console.log(latLong);
    const weather = await getParkWeather(latLong);
    if (weather) {
        forecast.innerHTML = '';
        buildWeatherDisplay(weather);
    }
}

function getWeatherEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code <= 3) return '☁️';
    if (code <= 48) return '🌫️';  // fog
    if (code <= 57) return '🌧️';  // drizzle
    if (code <= 67) return '🌧️';  // rain
    if (code <= 77) return '❄️';  // snow
    if (code <= 82) return '🌦️';  // showers
    if (code <= 86) return '🌨️';  // snow showers
    if (code <= 99) return '⛈️';  // thunderstorm
    return '🌡️';
}

// build the conditions summary section
async function buildWeatherDisplay(weather) {

    const days = weather.daily.time;

    days.forEach((date, i) => {
        const emoji = getWeatherEmoji(weather.daily.weathercode[i]);
        const high = Math.round(weather.daily.temperature_2m_max[i]);
        const low = Math.round(weather.daily.temperature_2m_min[i]);
        const precip = weather.daily.precipitation_probability_max[i];
        const wind = Math.round(weather.daily.windspeed_10m_max[i]);
        // the (/-/g '/') makes sure the date works in different time zones
        const dayLabel = new Date(date.replace(/-/g, '/')).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
       
        forecast.innerHTML += `
                <div class="forecast-day">
                <p class="day-label">${dayLabel}</p>
                <p class="weather-icon">${emoji}</p>
                <p class="temp-high">High: ${high}°F</p>
                <p class="temp-low">Low: ${low}°F</p>
                <p class="precip">💧 ${precip}%</p>
                <p class="wind">💨 ${wind} mph</p>
            </div>
        `;
    });

    // conditions summary
    const high = Math.round(weather.daily.temperature_2m_max[0]);
    const low = Math.round(weather.daily.temperature_2m_min[0]);
    const precip = weather.daily.precipitation_probability_max[0];
    const wind = Math.round(weather.daily.windspeed_10m_max[0]);
    const condition = conditionCheck(high, low, precip, wind);
    forecastSummary.innerHTML = '';
    forecastSummary.innerHTML += `
    <h3 class="${condition}">Current Conditions: ${condition}</h3>`;
    if (high > 85) {
        forecastSummary.innerHTML += `
    <p>High temperature: ${high}</p>`;
    }
    if (low < 45) {
        forecastSummary.innerHTML += `
    <p>Low temperature: ${low}</p>`;
    }
    if (precip > 25) {
        forecastSummary.innerHTML += `
    <p>Chance of precipitation: ${precip}</p>`;
    }
    if (wind > 15) {
        forecastSummary.innerHTML += `
    <p>Wind speed: ${wind}</wind>`;
    }
}

// condition check: logic for conditions summary
// consider adding a volume trigger such as >0.5 inches of total precip accumulation
// consider adding wind gusts > 40mph
function conditionCheck(high, low, precip, wind) {
    if (precip >= 75 ||
        wind >= 30 ||
        high >= 95 ||
        low <= 32) {
        return "challenging";
     }
    else if ((precip < 75 && precip > 25) ||
        (wind > 15 && wind < 30) ||
        (high > 85 && high < 95) ||
        (low > 32 && low < 45)) {
        return "fair";
    }
    else {
        return "good";
    }
}

// click listener for the saved parks list
listHere.addEventListener('click', (e) => {
    // handle remove button
    if (e.target.classList.contains('remove-park')) {
        const parkCode = e.target.dataset.parkcode;
        let storedData = JSON.parse(localStorage.getItem("selectedPark-ls") || "[]");
        storedData = storedData.filter(code => code !== parkCode);
        localStorage.setItem("selectedPark-ls", JSON.stringify(storedData));
        buildSavedList();  // rebuild the list
        // rebuild the summary using the most recently added park code
        if (storedData.length > 0) {
            buildSummaryData(storedData[storedData.length - 1]);
        } 
        else {
            parkSummary.innerHTML = '';
        }
        return;
    }
    // handle clicking on the park item itself to show summary
    const item = e.target.closest('.saved-park-item');
    if (!item) return;
    buildSummaryData(item.dataset.parkcode);
});



// on page load, build the list and show summary for most recently added park
async function init() {
    await buildSavedList();
    const storedData = JSON.parse(localStorage.getItem("selectedPark-ls") || "[]");
    if (storedData.length > 0) {
        buildSummaryData(storedData[storedData.length - 1]);
    }
}

init();