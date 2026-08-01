import { getSelectedParkData, getSavedParksData, getSelectedParkAlerts } from './api.mjs'
import { getParkWeather } from './open-mateo-api.mjs'

// define display locations
const parkSummary = document.querySelector("#parkSummary");
const listHere = document.querySelector("#listHere");

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

    // get latLong field and send to weather forecast
    const latLong = park.latLong;
    console.log(latLong);
    const forecast = getParkWeather(latLong);
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