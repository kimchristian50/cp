import { getParksData, getSelectedParkData, getSelectedParkThingsToDo } from './api.mjs'

const parkList = document.querySelector("#showHere");

// Target the select elements
const dropdownActivity = document.getElementById('activities');
const dropdownState = document.getElementById('state');
const searchInfo = document.querySelector('.search-info');
const searchResultInfo = document.querySelector('.search-result-info');
const tripSummaryList = document.querySelector("#tripSummaryList");

// Event listener for the activities dropdown menu
dropdownActivity.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log(`User selected: ${selectedValue}`);
    searchInfo.innerHTML = `<p>Showing parks with ${selectedValue}</p>`;
    buildList();
});

// Event listener for the state dropdown menu
dropdownState.addEventListener('change', (event) => {
    const selectedState = event.target.value;
    const selectedValue = dropdownActivity.value;
    console.log(`User selected: ${selectedState}`);
    searchInfo.innerHTML = `<p>Showing parks with ${selectedValue} in ${selectedState}</p>`;
    buildList();
});

async function buildList() {
    const selectedValue = dropdownActivity.value;
    const selectedState = dropdownState.value;

    // clear the screen
    parkList.innerHTML = ``;

    const parksData = await getParksData(selectedValue, selectedState);

    // guard clause in case nothing came back
    if (!parksData || !parksData.data) return;

    // filter by state in JavaScript since NPS may ignore stateCode when parkCode is present
    let filteredParks = parksData.data;
    if (selectedState) {
        filteredParks = parksData.data.filter(park =>
            park.states.includes(selectedState)
        );
    }

    // mention how many parks are in the filteredParks array when there are any results
    if (filteredParks.length != 0) {
        searchResultInfo.innerHTML = `
    <p>${filteredParks.length} Parks Found</p>`;
    }

    // if there is an activity chosen but no state, suggest filtering the list to narrow down the list
    if (selectedValue && !selectedState) {
        searchResultInfo.innerHTML += `
        <p>Add a state to narrow down the list.</p>`
    }

    // if there is both an activity and a state chosen, and there are no states with that activity, show this message
    if (selectedValue && selectedState) {
        if (filteredParks.length == 0) {
            searchResultInfo.innerHTML = `<p>No parks found for this activity.</p>`;
        }
    }

    // render a simple list
    filteredParks.forEach(park => {
        const activityIcon = findActivityIcon(selectedValue);
        parkList.innerHTML += `
        <div class="park-list-item" data-parkcode="${park.parkCode}">
            <span class="activity-icon">${activityIcon}</span>
            <div class="park-info">
            <p>${park.fullName}</p>
            <p>${park.states.replaceAll(",", ", ")}</p>
    </div>

    <span class="arrow">›</span>
        </div>
    `;
    });
}

// lookup an icon to make the park list friendlier
function findActivityIcon(selectedValue) {
    if (selectedValue == "Astronomy") { return "🔭" };
    if (selectedValue == "Biking") { return "🚲" };
    if (selectedValue == "Camping") { return "🏕️" };
    if (selectedValue == "Canyoneering") { return "🥾" };
    if (selectedValue == "Caving") { return "🪨" };
    if (selectedValue == "Climbing") { return "🧗" };
    if (selectedValue == "Fishing") { return "🎣" };
    if (selectedValue == "Hiking") { return "🥾" };
    if (selectedValue == "Paddling") { return "🚣" };
    if (selectedValue == "Skiing") { return "⛷️" };
    if (selectedValue == "Snorkeling") { return "🤿" };
    if (selectedValue == "Swimming") { return "🏊" };
    if (selectedValue == "Wildlife Watching") { return "🐐" };
}

// add a click listener for someone clicking on a park in the list
parkList.addEventListener('click', (e) => {
    const item = e.target.closest('.park-list-item');
    if (!item) return;
    const parkCode = item.dataset.parkcode;
    showParkDetail(parkCode);
});

// build the sticky trip summary list to show which parks have been added
async function updateTripSummary() {
    const stored = JSON.parse(localStorage.getItem("selectedPark-ls") || "[]");
    tripSummaryList.innerHTML = "";
    if (stored.length === 0) {
        tripSummaryList.innerHTML =
            "<p>No parks selected yet.</p>";
        return;
    }
    stored.forEach(park => {
        const activityIcon = findActivityIcon(park.activity);
        tripSummaryList.innerHTML += `<p>${activityIcon} ${park.fullName}</p>`;
    });
}

// dialog modal display when the user clicks on the parks in the list on the search page
async function showParkDetail(parkCode) {
    // Grab modal DOM elements dynamically ONLY when a card is clicked
    const mydialog = document.querySelector("#mydialog");
    const mytitle = document.querySelector("#mydialog h2");
    const myimg = document.querySelector("#mydialog img");
    const address = document.querySelector("#mydialog h3");
    const description = document.querySelector(".description");
    const directions = document.querySelector(".directions-info");
    const url = document.querySelector("#mydialog a");
    const toDo = document.querySelector("#things-to-do");
    const parkSelect = document.querySelector("#parkSelect");
    const myclose = document.querySelector("#closeDialog");
    const addedMessage = document.querySelector(".dialog-added");

    addedMessage.textContent = '';

    if (!mydialog) return; // Safety check if a page skips the modal HTML structure

    const parkData = await getSelectedParkData(parkCode);
    const parkToDo = await getSelectedParkThingsToDo(parkCode);

    const image = parkData.data[0].images[0];

    mytitle.textContent = parkData.data[0].fullName;
    if (image) {
        myimg.src = image.url;
        myimg.alt = image.altText;
        myimg.width = "600"
        myimg.height = "420"
        myimg.loading = "lazy"
    }
    address.textContent = `${parkData.data[0].addresses[0].line1} ${parkData.data[0].addresses[0].line2}, ${parkData.data[0].addresses[0].city} ${parkData.data[0].addresses[0].stateCode}`;
    description.textContent = parkData.data[0].description;
    url.textContent = parkData.data[0].url;
    url.href = parkData.data[0].url;
    url.target = "_blank";
    directions.textContent = parkData.data[0].directionsInfo;

    if (parkToDo.length > 1) { // if there are additional ideas from the /thingstodo endpoint, list them here:
        toDo.innerHTML = `<h4>Additional ideas for things to do:</h4>`

        parkToDo.forEach(thing => {
            toDo.innerHTML += `
        <li>${thing.shortDescription || thing.longDescription} 
        <a href="${thing.url}" target="_blank">${thing.url}</a>
        </li>`;
        });
    }

    myclose.onclick = () => mydialog.close();

    // Check localStorage to see if this park is already selected
    let storedData = localStorage.getItem("selectedPark-ls") || "[]";
    let selectedList = JSON.parse(storedData);

    if (parkSelect) {
        if (selectedList.some(p => p.parkCode === parkCode)) {
            parkSelect.textContent = "Added! ✓";
            parkSelect.disabled = true;

        } else {
            parkSelect.textContent = "Select this Park";
            parkSelect.disabled = false;
        }

        // Fresh event handler that doesn't pile up listeners permanently
        parkSelect.onclick = () => {
            let currentData = localStorage.getItem("selectedPark-ls") || "[]";
            let currentList = JSON.parse(currentData);

            if (!currentList.find(p => p.parkCode === parkCode)) {
                const park = parkData.data[0];
                park.activity = dropdownActivity.value;
                parkSelect.classList.add("added");
                currentList.push(park);
            };
            localStorage.setItem("selectedPark-ls", JSON.stringify(currentList));
            updateTripSummary();

            parkSelect.textContent = "Added! ✓";
            parkSelect.disabled = true;
            addedMessage.textContent = `${parkData.data[0].fullName} added to My Trip.`;
        };
    }
    mydialog.showModal()
}

buildList();
updateTripSummary();
window.addEventListener("focus", updateTripSummary);