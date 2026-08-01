// set the current year
const today = new Date();

// find the span with id="currentyear" and put the year inside it
document.querySelector("#currentyear").textContent = today.getFullYear();

// set the last modified date
document.querySelector("#lastModified").textContent = `Last Modification: ${document.lastModified}`;

