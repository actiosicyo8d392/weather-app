// TypeScript interfaces for API response
interface WeatherLocation {
  name: string;
  country: string;
  localtime: string;
}

interface WeatherCondition {
  text: string;
  icon: string;
}

interface AirQuality {
  "us-epa-index": number;
}

interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  condition: WeatherCondition;
  humidity: number;
  wind_kph: number;
  vis_km: number;
  pressure_mb: number;
  air_quality?: AirQuality;
}

interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
}

// API Configuration
const API_KEY: string = "d03bf17101ed4078bf9113758252806";
const BASE_URL: string = "http://api.weatherapi.com/v1/current.json";

// Application State
let currentWeatherData: WeatherData | null = null;
let searchHistory: string[] = [];
let isCelsius: boolean = true;

// DOM Elements
const cityInput = document.getElementById("cityInput") as HTMLInputElement;
const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
const weatherContainer = document.getElementById(
  "weatherContainer"
) as HTMLElement;
const loading = document.getElementById("loading") as HTMLElement;
const error = document.getElementById("error") as HTMLElement;
const historyBtn = document.getElementById("historyBtn") as HTMLButtonElement;
const historyDropdown = document.getElementById(
  "historyDropdown"
) as HTMLElement;
const historyList = document.getElementById("historyList") as HTMLElement;
const toggleUnitBtn = document.getElementById(
  "toggleUnitBtn"
) as HTMLButtonElement;
const unitText = document.getElementById("unitText") as HTMLElement;

// Weather data elements
const cityName = document.getElementById("cityName") as HTMLElement;
const country = document.getElementById("country") as HTMLElement;
const currentDate = document.getElementById("currentDate") as HTMLElement;
const currentTime = document.getElementById("currentTime") as HTMLElement;
const temperature = document.getElementById("temperature") as HTMLElement;
const feelsLike = document.getElementById("feelsLike") as HTMLElement;
const weatherIcon = document.getElementById("weatherIcon") as HTMLImageElement;
const weatherCondition = document.getElementById(
  "weatherCondition"
) as HTMLElement;
const humidity = document.getElementById("humidity") as HTMLElement;
const windSpeed = document.getElementById("windSpeed") as HTMLElement;
const visibility = document.getElementById("visibility") as HTMLElement;
const pressure = document.getElementById("pressure") as HTMLElement;
const aqiValue = document.getElementById("aqiValue") as HTMLElement;
const aqiLabel = document.getElementById("aqiLabel") as HTMLElement;
const errorMessage = document.getElementById("errorMessage") as HTMLElement;

// Color of quality message
function getAQIColorClass(epaIndex: number): string {
  switch (epaIndex) {
    case 1:
      return "bg-green-200 border-green-200"; // Good
    case 2:
      return "bg-yellow-200 border-yellow-200"; // Moderate
    case 3:
      return "bg-orange-200 border-orange-200"; // Unhealthy for Sensitive Groups
    case 4:
      return "bg-red-200 border-red-200"; // Unhealthy
    case 5:
      return "bg-purple-200 border-purple-200"; // Very Unhealthy
    case 6:
      return "bg-pink-200 border-pink-200"; // Hazardous
    default:
      return "bg-gray-200 border-gray-200"; // Unknown
  }
}

// Event Listeners
searchBtn.addEventListener("click", (): void => {
  getWeather();
});
cityInput.addEventListener("keypress", (e: KeyboardEvent): void => {
  if (e.key === "Enter") getWeather();
});
historyBtn.addEventListener("click", (): void => {
  toggleHistoryDropdown();
});
toggleUnitBtn.addEventListener("click", (): void => {
  toggleTemperatureUnit();
});

// Main function to get weather data
async function getWeather(city: string | null = null): Promise<void> {
  const query: string = city || cityInput.value.trim();
  if (!query) return;
  showLoading();
  hideError();
  try {
    const response: Response = await fetch(
      `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`
    );
    if (!response.ok) throw new Error("City not found");
    const data: WeatherData = await response.json();
    currentWeatherData = data;
    displayWeather(data);
    addToSearchHistory(data.location.name);
    hideLoading();
  } catch (err) {
    showError("City not found. Please try again.");
    hideLoading();
  }
}

// Display weather data in the UI
function displayWeather(data: WeatherData): void {
  hideError();
  cityName.textContent = data.location.name;
  country.textContent = data.location.country;
  currentDate.textContent = data.location.localtime.split(" ")[0];
  currentTime.textContent = data.location.localtime.split(" ")[1];
  updateTemperature(data.current);
  weatherIcon.src = data.current.condition.icon;
  weatherCondition.textContent = data.current.condition.text;
  humidity.textContent = data.current.humidity + "%";
  windSpeed.textContent = data.current.wind_kph + " km/h";
  visibility.textContent = data.current.vis_km + " km";
  pressure.textContent = data.current.pressure_mb + " mb";

  const airQualitySection = document.querySelector(
    ".air-quality"
  ) as HTMLElement;
  if (data.current.air_quality && data.current.air_quality["us-epa-index"]) {
    const epaIndex: number = data.current.air_quality["us-epa-index"]; // <-- FIXED
    aqiValue.textContent = epaIndex.toString();
    aqiLabel.textContent = getAQILabel(epaIndex);
    airQualitySection.className =
      "air-quality rounded-2xl p-6 transition-colors duration-500 " +
      getAQIColorClass(epaIndex);
  } else {
    aqiValue.textContent = "--";
    aqiLabel.textContent = "--";
    airQualitySection.className =
      "air-quality bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100";
  }
}

// Update temperature display with unit conversion
function updateTemperature(current: CurrentWeather): void {
  if (isCelsius) {
    temperature.textContent = `${current.temp_c}°C`;
    feelsLike.textContent = `Feels like ${current.feelslike_c}°C`;
    unitText.textContent = "°C";
  } else {
    temperature.textContent = `${current.temp_f}°F`;
    feelsLike.textContent = `Feels like ${current.feelslike_f}°F`;
    unitText.textContent = "°F";
  }
}

// Get air quality label based on EPA index
function getAQILabel(epaIndex: number): string {
  switch (epaIndex) {
    case 1:
      return "Good";
    case 2:
      return "Moderate";
    case 3:
      return "Unhealthy for Sensitive Groups";
    case 4:
      return "Unhealthy";
    case 5:
      return "Very Unhealthy";
    case 6:
      return "Hazardous";
    default:
      return "Unknown";
  }
}

// Add city to search history
function addToSearchHistory(city: string): void {
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city);
    if (searchHistory.length > 10) searchHistory.pop();
    updateHistoryDropdown();
  }
}

// Update history dropdown display
function updateHistoryDropdown(): void {
  if (searchHistory.length === 0) {
    historyList.innerHTML =
      '<div class="px-4 py-5 text-center text-gray-500 text-sm italic">No recent searches</div>';
    return;
  }

  historyList.innerHTML = searchHistory
    .map(
      (city: string): string => `
        <div class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100 hover:bg-gray-50 border-b border-gray-100"
             onclick="selectFromHistory('${city.replace(/'/g, "\\'")}')">
            <i class="fas fa-map-marker-alt text-blue-500 text-sm"></i>
            <span class="flex-1 text-sm text-gray-800">${city}</span>
            <button class="text-red-500 bg-transparent border-none cursor-pointer p-1 rounded transition-colors duration-200 hover:bg-red-50"
                    onclick="removeFromHistory('${city.replace(
                      /'/g,
                      "\\'"
                    )}', event)">
                <i class="fas fa-times text-xs"></i>
            </button>
        </div>
    `
    )
    .join("");
}

// Remove city from history
function removeFromHistory(city: string, event: Event): void {
  event.stopPropagation();
  searchHistory = searchHistory.filter((c: string): boolean => c !== city);
  updateHistoryDropdown();
}

// Show/hide history dropdown
function toggleHistoryDropdown(): void {
  if (historyDropdown.classList.contains("opacity-0")) {
    showHistoryDropdown();
  } else {
    hideHistoryDropdown();
  }
}

function showHistoryDropdown(): void {
  historyDropdown.classList.remove("opacity-0", "invisible");
  historyDropdown.classList.add("opacity-100", "visible");
}

function hideHistoryDropdown(): void {
  historyDropdown.classList.add("opacity-0", "invisible");
  historyDropdown.classList.remove("opacity-100", "visible");
}

document.addEventListener("click", (e: Event): void => {
  const target = e.target as HTMLElement;
  if (!historyDropdown.contains(target) && target !== historyBtn) {
    hideHistoryDropdown();
  }
});

// Toggle temperature unit
function toggleTemperatureUnit(): void {
  isCelsius = !isCelsius;
  if (currentWeatherData) updateTemperature(currentWeatherData.current);
}

// UI Helper Functions
function showLoading(): void {
  loading.classList.remove("hidden");
}
function hideLoading(): void {
  loading.classList.add("hidden");
}
function showError(message: string): void {
  errorMessage.textContent = message;
  error.classList.remove("hidden");
}
function hideError(): void {
  error.classList.add("hidden");
}

// Initialize UI state on load
function initializeUI(): void {
  // Hide loading and error elements by default
  hideLoading();
  hideError();
}

// To hide error message
const closeErrorBtn = document.getElementById(
  "closeErrorBtn"
) as HTMLButtonElement;
closeErrorBtn.addEventListener("click", (): void => {
  hideError();
});

// Inline onclick handlers
(window as any).selectFromHistory = function (city: string): void {
  getWeather(city);
  hideHistoryDropdown();
};

(window as any).removeFromHistory = function (
  city: string,
  event: Event
): void {
  event.stopPropagation();
  searchHistory = searchHistory.filter((c: string): boolean => c !== city);
  updateHistoryDropdown();
};

// Optionally, load last searched city on page load
window.addEventListener("DOMContentLoaded", (): void => {
  // Initialize UI state first
  initializeUI();

  if (searchHistory.length > 0) {
    getWeather(searchHistory[0]);
  } else {
    getWeather("Bangalore, India");
    addToSearchHistory("Bangalore, India");
  }
});
