import { getParksData, getSelectedParkData } from './api.mjs'

const parkList = document.querySelector("#showHere");

// Target the select elements
const dropdownActivity = document.getElementById('activities');
const dropdownState = document.getElementById('state');

// Event listener for the activities dropdown menu
dropdownActivity.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log(`User selected: ${selectedValue}`);
    buildList();
});

// Event listener for the state dropdown menu
dropdownState.addEventListener('change', (event) => {
    const selectedState = event.target.value;
    console.log(`User selected: ${selectedState}`);
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

    // if there is an activity chosen but no state, suggest filtering the list to narrow down the list
    if (selectedValue && !selectedState) {
        parkList.innerHTML += `
        <p class="suggest">Add a state to narrow down the list.`
    }

    // in buildCard, just render a simple list instead of the cards
    filteredParks.forEach(park => {
        parkList.innerHTML += `
        <div class="park-list-item" data-parkcode="${park.parkCode}">
            <p>${park.fullName} (${park.states})</p>
        </div>
    `;
    });

    // // or make the park cards with the images having lazy loading
    // filteredParks.forEach(park => {
    //     const imageUrl = park.images[0]?.url ?? '';
    //     const imageAlt = park.images[0]?.altText ?? park.fullName;
    //     parkList.innerHTML += `
    //         <div class="park-card">
    //             <img src="${imageUrl}" alt="${imageAlt}" loading="lazy" img.width=300 img.height=200>
    //             <h3>${park.fullName}</h3>
    //             <p>${park.states}</p>
    //         </div>
    //     `;
    // });
}

// add a click listener for someone clicking on a park in the list
parkList.addEventListener('click', (e) => {
    const item = e.target.closest('.park-list-item');
    if (!item) return;
    const parkCode = item.dataset.parkcode;
    showParkDetail(parkCode);
});

buildList();

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
    const parkSelect = document.querySelector("#parkSelect");
    const myclose = document.querySelector("#mydialog button");

    if (!mydialog) return; // Safety check if a page skips the modal HTML structure

    const parkData = await getSelectedParkData(parkCode);

    mytitle.textContent = parkData.data[0].fullName;
    myimg.src = parkData.data[0].images[0].url
    myimg.alt = parkData.data[0].images[0].altText
    myimg.width = "300"
    myimg.height = "210"
    myimg.loading = "lazy"
    address.innerHTML = `${parkData.data[0].addresses[0].line1} ${parkData.data[0].addresses[0].line2}, ${parkData.data[0].addresses[0].city} ${parkData.data[0].addresses[0].stateCode}`;
    description.textContent = parkData.data[0].description;
    url.textContent = parkData.data[0].url;
    url.href = parkData.data[0].url;
    url.target = "_blank";
    directions.textContent = parkData.data[0].directionsInfo;

    myclose.onclick = () => mydialog.close();

        // Check localStorage to see if this park is already selected
        let storedData = localStorage.getItem("selectedPark-ls") || "[]";
        let selectedList = JSON.parse(storedData);

        if (parkSelect) {
            if (selectedList.includes(parkCode)) {
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

                if (!currentList.includes(parkCode)) {
                    currentList.push(parkCode);
                }
                localStorage.setItem("selectedPark-ls", JSON.stringify(currentList));

                parkSelect.textContent = "Added! ✓";
                parkSelect.disabled = true;
            };
        }
    mydialog.showModal()
}