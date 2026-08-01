// hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4 

async function convertToJson(res) {
    const jsonResponse = await res.json();
    if (res.ok) {
        return jsonResponse;
    } else {
        throw { name: "servicesError", message: jsonResponse };
    }
}

export async function getParksData(selectedValue, selectedState) {

    let activityUrl = `https://developer.nps.gov/api/v1/activities/parks/?q=${selectedValue}&api_key=hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4`;

    try {
        // Fetch the API data
        const activityResponse = await fetch(activityUrl);

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
        let parksUrl = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCodes}&limit=100&stateCode=${selectedState}&api_key=hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4`;
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
    let parkUrl = `https://developer.nps.gov/api/v1/parks/?parkCode=${parkCode}&api_key=hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4`;

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
    const parkCodes = JSON.parse(storedData);

    // if nothing saved, return empty
    if (parkCodes.length === 0) return [];

    // one API call with all codes at once
    const parkCodesString = parkCodes.join(',');
    const url = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCodesString}&fields=images&api_key=hrAcUlvdIURoFZD3jIpeXOcELsNzj2MGGYqXoWL4`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await convertToJson(response);
        return data.data;
    } catch (error) {
        console.error("Could not fetch saved parks:", error);
        return [];
    }
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