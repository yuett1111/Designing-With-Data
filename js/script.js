let countries = [];
let selectedCountry;
let selectedWeather = "Unavailable";
let passport = [];
let currentRegion = "All";
let currentRarity = "All";

const countryApi = "https://pw-d20261017a29.plainwork-apps.workers.dev/v3.1/all?fields=name,capital,flags,population,region,capitalInfo,cca3,unMember";

if (localStorage.getItem("passport")) {
    passport = JSON.parse(localStorage.getItem("passport"));
}

function showPage(page) {

    document.querySelector("#homePage").className = "hidden";
    document.querySelector("#passportPage").className = "hidden";

    if (page === "home") {
        document.querySelector("#homePage").className = "";
    } else {
        document.querySelector("#passportPage").className = "";
        displayPassport();
    }
}

 async function loadCountries() {
    try {
        const response = await fetch(countryApi);

        if (!response.ok) {
            throw new Error("Country API failed");
        }

        const data = await response.json();

        countries = data;

        document.querySelector("#message").textContent =
            "Ready to spin!";

    } catch (error) {
        console.log(error);

        document.querySelector("#message").textContent =
            "Failed to load countries.";
    }
}

function getRarity(population) {
    if (population > 50000000) {
        return "Common";
    } else if (population > 10000000) {
        return "Rare";
    } else if (population >= 1000000) {
        return "Epic";
    } else {
        return "Legendary";
    }
}

function pickCountry() {
    let random = Math.random() * 100;
    let rarity;
    if (random < 50) {
        rarity = "Common";
    } else if (random < 80) {
        rarity = "Rare";
    } else if (random < 95) {
        rarity = "Epic";
    } else {
        rarity = "Legendary";
    }

    let possibleCountries = [];
    for (let i = 0; i < countries.length; i++) {
        let country = countries[i];
        if (getRarity(country.population) === rarity) {
            possibleCountries.push(country);
        }
    }

    if (possibleCountries.length > 0) {
        let index = Math.floor(Math.random() * possibleCountries.length);
        return possibleCountries[index];
    } else {
        let index = Math.floor(Math.random() * countries.length);
        return countries[index];
    }
}

async function spinGacha() {

    if (countries.length === 0) {
        return;
    }

    document.querySelector("#spinButton").disabled = true;
    document.querySelector("#message").textContent = "Spinning...";
    document.querySelector("#countryCard").className = "hidden";
    document.querySelector("#emptyMessage").className = "hidden";   
    document.querySelector("#gachaMachine").className = "shake";

    selectedCountry = pickCountry();
    let rarity = getRarity(selectedCountry.population);

    document.querySelector("#capsule").className =
        "capsule " + rarity.toLowerCase();

    await getWeather(); 
    document.querySelector("#gachaMachine").className = "";
    document.querySelector("#capsule").className = "hidden";
    showCountry();
    document.querySelector("#message").textContent =
        "You discovered " + selectedCountry.name.common + "! ";

    document.querySelector("#spinButton").disabled = false;
}

async function getWeather() {

    selectedWeather = "Unavailable";
    let coordinates = selectedCountry.capitalInfo.latlng;
    if (!coordinates || coordinates.length < 2) {
        return;
    }

    let latitude = coordinates[0];
    let longitude = coordinates[1];

    let weatherApi =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        latitude + "&longitude=" + longitude +
        "&current=temperature_2m,weather_code";

    try {
        const response = await fetch(weatherApi);
        if (!response.ok) {
            throw new Error("Weather API failed");
        }
        const data = await response.json();

        let temperature = data.current.temperature_2m;
        let code = data.current.weather_code;

        let weatherType;
        if (code === 0) {
            weatherType = "sunny";
        } else if (code >= 1 && code <= 3) {
            weatherType = "cloudy";
        } else if (code >= 51 && code <= 67) {
            weatherType = "rainy";
        } else if (code >= 80 && code <= 82) {
            weatherType = "rainy";
        } else if (code >= 71 && code <= 77) {
            weatherType = "snowy";
        } else if (code >= 85 && code <= 86) {
            weatherType = "snowy";
        } else if (code >= 95) {
            weatherType = "stormy";
        } else {
            weatherType = "cloudy";
        }
        selectedWeather = temperature + "°C " + weatherType;

    } catch (error) {
        console.log(error);
    }
}


function showCountry() {
    let country = selectedCountry;
    let rarity = getRarity(country.population);

    document.querySelector("#countryName").textContent =
        country.name.common;
    document.querySelector("#countryFlag").src =
        country.flags.png;
    if (country.capital && country.capital.length > 0) {
        document.querySelector("#capital").textContent = country.capital[0];
    } else {
    document.querySelector("#capital").textContent = "N/A";
    }
    document.querySelector("#population").textContent =
        country.population.toLocaleString();
    document.querySelector("#region").textContent =
        country.region;
    document.querySelector("#weather").textContent =
        selectedWeather;
    document.querySelector("#rarityText").textContent =
        "⭐ " + rarity;
    document.querySelector("#countryCard").className =
        rarity.toLowerCase();

    if (selectedWeather.includes("sunny")) {
        document.querySelector("#countryCard").className += " sunny";
    } else if (selectedWeather.includes("rainy")) {
        document.querySelector("#countryCard").className += " rainy";
    } else if (selectedWeather.includes("snowy")) {
        document.querySelector("#countryCard").className += " snowy";
    } else if (selectedWeather.includes("stormy")) {
        document.querySelector("#countryCard").className += " stormy";
    } else if (selectedWeather.includes("cloudy")) {
        document.querySelector("#countryCard").className += " cloudy";
    }
}

function saveCountry() {
    if (!selectedCountry) {
        return;
    }
    for (let i = 0; i < passport.length; i++) {
        if (passport[i].cca3 === selectedCountry.cca3) {
            alert("You already collected this country!");
            return;
        }
    }
    passport.push(selectedCountry);
    localStorage.setItem("passport", JSON.stringify(passport));
    alert(selectedCountry.name.common + " saved to passport!");
}

function filterRegion(region) {
    currentRegion = region;
    displayPassport();
}

function filterRarity(rarity) {
    currentRarity = rarity;
    displayPassport();
}

function updateRarityStats() {
    let common = 0;
    let rare = 0;
    let epic = 0;
    let legendary = 0;

    for (let i = 0; i < passport.length; i++) {
        let rarity = getRarity(passport[i].population);

        if (rarity === "Common") {
            common++;
        } else if (rarity === "Rare") {
            rare++;
        } else if (rarity === "Epic") {
            epic++;
        } else if (rarity === "Legendary") {
            legendary++;
        }
    }

    document.querySelector("#commonCount").textContent = common;
    document.querySelector("#rareCount").textContent = rare;
    document.querySelector("#epicCount").textContent = epic;
    document.querySelector("#legendaryCount").textContent = legendary;
}

function displayPassport() {

    updateRarityStats();

    let collection = document.querySelector("#passportCollection");

    collection.innerHTML = "";
    document.querySelector("#collectionCount").textContent =
        passport.length + " Countries Collected";

    let progress = 0;
    if (countries.length > 0) {
        progress = passport.length / countries.length * 100;
    }
    document.querySelector("#progressFill").style.width =
        progress + "%";

    let visibleCountries = 0;

    for (let i = 0; i < passport.length; i++) {
        let country = passport[i];
        let rarity = getRarity(country.population);

        if ((currentRegion === "All" || country.region === currentRegion) && (currentRarity === "All" || rarity === currentRarity)) {

            visibleCountries++;

            collection.innerHTML +=
                '<div class="savedCard ' + rarity.toLowerCase() + '">' +
                '<img src="' + country.flags.png + '">' +
                '<h3>' + country.name.common + '</h3>' +
                '<p>Rarity: ' + rarity + '</p>' +
                '<p>Capital: ' + (country.capital ? country.capital[0] : "N/A") + '</p>' +
                '<p>Population: ' + country.population.toLocaleString() + '</p>' +
                '<p>Region: ' + country.region + '</p>' +
                '<button onclick="removeCountry(' + i + ')">Remove</button>' +
                '</div>';
        }
    }

    if (visibleCountries === 0) {
        if (passport.length === 0) {
            collection.innerHTML = '<p class="emptyMessage">🌍 No countries collected yet!</p>';
        } else {
            collection.innerHTML = '<p class = "emptyMessage">No countries found in this category!</p>';
    }
}


}

function removeCountry(index) {
    passport.splice(index, 1);
    localStorage.setItem("passport", JSON.stringify(passport));
    displayPassport();
}

loadCountries();
