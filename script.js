const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const refreshBtn = document.getElementById("refreshBtn");

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name!");
        return;
    }

    const loading = document.getElementById("loadingMessage");
    loading.textContent = "Getting weather information...";

    try {

        // Find city coordinates
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {

            document.getElementById("cityName").textContent = "City Not Found";
            document.getElementById("temperature").textContent = "-- °C";
            document.getElementById("description").textContent = "Please enter a valid city name.";
            document.getElementById("humidity").textContent = "--%";
            document.getElementById("wind").textContent = "-- km/h";
            document.getElementById("weatherIcon").textContent = "❓";
            document.getElementById("forecastContainer").innerHTML = "";
            document.getElementById("lastUpdated").textContent = "";

            loading.textContent = "";
            return;
        }

        const location = geoData.results[0];

        // Get weather information
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Weather information could not be loaded.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        // Display current weather
        document.getElementById("cityName").textContent = location.name;
        document.getElementById("temperature").textContent = current.temperature_2m + " °C";
        document.getElementById("humidity").textContent = current.relative_humidity_2m + "%";
        document.getElementById("wind").textContent = current.wind_speed_10m + " km/h";
        document.getElementById("description").textContent = getWeatherDescription(current.weather_code);
        document.getElementById("weatherIcon").textContent = getWeatherIcon(current.weather_code);

        // Display last updated time
        document.getElementById("lastUpdated").textContent =
            "Last updated: " + new Date().toLocaleString();

        // Display 7-day forecast
        const forecastContainer = document.getElementById("forecastContainer");

        forecastContainer.innerHTML = "";

        for (let i = 0; i < daily.time.length; i++) {

            const day = new Date(daily.time[i] + "T00:00:00")
                .toLocaleDateString("en-US", { weekday: "short" });

            const forecastCard = document.createElement("div");

            forecastCard.className = "forecast-card";

            forecastCard.innerHTML = `
                <h3>${day}</h3>
                <p>${getWeatherDescription(daily.weather_code[i])}</p>
                <p>High: ${daily.temperature_2m_max[i]}°C</p>
                <p>Low: ${daily.temperature_2m_min[i]}°C</p>
            `;

            forecastContainer.appendChild(forecastCard);
        }

        loading.textContent = "";

    }

    catch (error) {

        console.error("Weather Error:", error);

        document.getElementById("cityName").textContent = "Something went wrong";
        document.getElementById("temperature").textContent = "-- °C";
        document.getElementById("description").textContent = "Unable to get weather information. Please try again.";
        document.getElementById("humidity").textContent = "--%";
        document.getElementById("wind").textContent = "-- km/h";
        document.getElementById("weatherIcon").textContent = "⚠️";
        document.getElementById("forecastContainer").innerHTML = "";

        loading.textContent = "";
    }
}

// Weather descriptions
function getWeatherDescription(code) {

    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 57) return "Drizzle";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain Showers";
    if (code <= 86) return "Snow Showers";
    if (code <= 99) return "Thunderstorm";

    return "Unknown Weather";
}

// Weather icons
function getWeatherIcon(code) {

    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌦️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌧️";
    if (code <= 86) return "🌨️";
    if (code <= 99) return "⛈️";

    return "🌡️";
}

// Search button
searchBtn.addEventListener("click", getWeather);

// Enter key
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Refresh button
if (refreshBtn) {
    refreshBtn.addEventListener("click", getWeather);
}