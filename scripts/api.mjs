const API_KEY = "hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4";
const BASE_URL = "https://developer.nps.gov/api/v1";

async function convertToJson(res) {
    const jsonResponse = await res.json();
    if (res.ok) {
        return jsonResponse;
    } else {
        throw { name: "servicesError", message: jsonResponse };
    }
}

export async function getParksData(selectedValue, selectedState) {
    let activityUrl = `${BASE_URL}/activities/parks/?q=${selectedValue}&api_key=${API_KEY}`;

    try {
        // Fetch the API data
        const activityResponse = await fetch(activityUrl);

        // troubleshooting in the console if calls are failing
        console.log("Status:", activityResponse.status);
        console.log("Rate limit:", activityResponse.headers.get("X-RateLimit-Limit"));
        console.log("Remaining:", activityResponse.headers.get("X-RateLimit-Remaining"));

        // Verify network response status
        if (!activityResponse.ok) {
            throw new Error(`HTTP error! status: ${activityResponse.status}`);
        }

        // Convert JSON
        const activityData = await convertToJson(activityResponse);

        // Debug log to inspect raw response structure
        console.log("Category:", selectedValue, activityData);

        // Safely extract parks array (Optional Chaining ?. prevents crashes)
        const parks = activityData?.data?.[0]?.parks || [];

        if (parks.length === 0) {
            return { data: [] };
        }

        // build a comma-separated string of all the park codes for this activity
        const parkCodes = parks.map(p => p.parkCode).join(',');

        // now fetch full details for all of the park codes in one call
        let parksUrl = `${BASE_URL}/parks/?parkCode=${parkCodes}&limit=100&stateCode=${selectedState}&api_key=${API_KEY}`;
        const parksResponse = await fetch(parksUrl);
        const parksData = await convertToJson(parksResponse);
        console.log("Parks: ", parksData);

        // return parks object
        return parksData;


    } catch (error) {
        console.error("Could not fetch parks data:", error);
        return { data: [] };
    }
}

export async function getSelectedParkData(parkCode) {
    let parkUrl = `${BASE_URL}/parks/?parkCode=${parkCode}&api_key=${API_KEY}`;

    try {
        // Fetch the API data
        const parkResponse = await fetch(parkUrl);

        // Verify network response status
        if (!parkResponse.ok) {
            throw new Error(`HTTP error! status: ${parkResponse.status}`);
        }

        // Convert JSON
        const parkData = await convertToJson(parkResponse);

        // Debug log to inspect raw response structure
        console.log("Park code:", parkCode, parkData);

        return parkData;

    } catch (error) {
        console.error("Could not fetch parks data:", error);
        return { data: [] };
    }
}

export async function getSavedParksData() {
    // get the array of park codes from localStorage
    const storedData = localStorage.getItem("selectedPark-ls") || "[]";
    const parks = JSON.parse(storedData);

    // if nothing saved, return empty
    if (parks.length === 0) return [];

    return parks;
}

export async function getSelectedParkAlerts(parkCode) {
    let parkUrl = `https://developer.nps.gov/api/v1/alerts/?parkCode=${parkCode}&api_key=hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4`;

    try {
        // Fetch the API data
        const parkResponse = await fetch(parkUrl);

        // Verify network response status
        if (!parkResponse.ok) {
            throw new Error(`HTTP error! status: ${parkResponse.status}`);
        }

        // Convert JSON
        const parkData = await convertToJson(parkResponse);

        // Debug log to inspect raw response structure
        console.log("Park code:", parkCode, parkData);

        return parkData;

    } catch (error) {
        console.error("Could not fetch parks data:", error);
        return { data: [] };
    }
}

export async function getSelectedParkThingsToDo(parkCode) {
    let parkUrl = `https://developer.nps.gov/api/v1/thingstodo?parkCode=${parkCode}&api_key=hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4`;

    try {
        // Fetch the API data
        const parkResponse = await fetch(parkUrl);
        // Verify network response status
        if (!parkResponse.ok) {
            throw new Error(`HTTP error! status: ${parkResponse.status}`);
        }
        // Convert JSON
        const parkToDo = await convertToJson(parkResponse);
        // Debug log to inspect raw response structure
        console.log("Park Things to do:", parkCode, parkToDo);
        return parkToDo.data;

    } catch (error) {
        console.error("Could not fetch parks data:", error);
        return { data: [] };
    }
}