const apiKey = 'a5d5dce919d66796194233c8ca375821'; // replace with your OpenWeatherMap API key

const cityInput = document.getElementById('city-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const description = document.getElementById('description');
const windSpeed = document.getElementById('wind-speed');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const localTime = document.getElementById('local-time');
const weatherIcon = document.getElementById('weather-icon');
const tip = document.getElementById('tip');
const bgAudio = document.getElementById('bg-audio');
const splash = document.getElementById('splash');
const chartBox = document.getElementById('chart-box');
let forecastChart;

// Splash screen
window.addEventListener('load', () => {
  setTimeout(() => {
    splash.classList.add('hidden');
    document.getElementById('main-container').classList.remove('hidden');
  }, 2000);
});

// Auto-detect location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    },
    err => {
      console.warn('User denied geolocation:', err);
      document.getElementById('loading-message').textContent = "Enter a city to see weather:";
    }
  );
} else {
  document.getElementById('loading-message').textContent = "Enter a city to see weather:";
}

// Manual city search
getWeatherBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    alert('Please enter a city name');
  }
});

// Fetch weather by city
async function fetchWeatherData(city) {
  document.getElementById('loading-message').textContent = "Loading...";
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    if (data.cod === 200) {
      displayWeatherData(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    } else {
      alert('City not found');
      document.getElementById('loading-message').textContent = "";
    }
  } catch (e) {
    console.error(e);
  }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  document.getElementById('loading-message').textContent = "Loading...";
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    if (data.cod === 200) {
      displayWeatherData(data);
      fetchForecast(lat, lon);
    }
  } catch (e) {
    console.error(e);
  }
}

// Display data
function displayWeatherData(data) {
  cityName.textContent = `Weather in ${data.name}`;
  temperature.textContent = `Temperature: ${data.main.temp}°C`;
  feelsLike.textContent = `Feels like: ${data.main.feels_like}°C`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
  description.textContent = `Condition: ${data.weather[0].description}`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  sunrise.textContent = `🌅 Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
  sunset.textContent = `🌇 Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
  localTime.textContent = `🕒 Local Time: ${new Date().toLocaleTimeString()}`;
  weatherIcon.textContent = getWeatherEmoji(data.weather[0].main);
  tip.textContent = data.weather[0].main === 'Rain' ? "🌧️ Take an umbrella today!" : "😊 Have a nice day!";

  weatherInfo.classList.remove('hidden');
  document.getElementById('loading-message').textContent = "";
  changeBackgroundAndMusic(data.weather[0].main);
}

// Weather emoji
function getWeatherEmoji(main) {
  switch (main) {
    case 'Clear': return "☀️";
    case 'Rain': return "🌧️";
    case 'Clouds': return "☁️";
    case 'Snow': return "❄️";
    case 'Thunderstorm': return "⛈️";
    default: return "🌡️";
  }
}

// Change bg & music
function changeBackgroundAndMusic(weather) {
  const body = document.body;
  bgAudio.pause();
  if (weather === 'Rain') {
    body.style.background = "linear-gradient(#5f9ea0, #708090)";
    bgAudio.src = "rain.mp3";
  } else if (weather === 'Clear') {
    body.style.background = "linear-gradient(#f6d365, #fda085)";
    bgAudio.src = "birds.mp3";
  } else {
    body.style.background = "linear-gradient(#83a4d4, #b6fbff)";
    bgAudio.src = "";
  }
  bgAudio.volume = 0.2;
  bgAudio.play().catch(()=>{});
}

// Forecast chart
async function fetchForecast(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    const labels = data.list.slice(0, 5).map(d => new Date(d.dt * 1000).toLocaleDateString());
    const temps = data.list.slice(0, 5).map(d => d.main.temp);
    if (forecastChart) forecastChart.destroy();
    forecastChart = new Chart(document.getElementById('forecastChart'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Next days temperature (°C)', data: temps, borderColor: '#4CAF50', fill: false }] },
      options: { responsive: true }
    });
    chartBox.classList.remove('hidden');
  } catch (e) {
    console.error(e);
  }
}

// Dark mode
document.getElementById('dark-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Language
const translations = {
  en: { title: "Weather App ☀️", tip: "Have a nice day!" },
  fr: { title: "Météo ☀️", tip: "Bonne journée!" },
  hi: { title: "मौसम ऐप ☀️", tip: "आपका दिन शुभ हो!" }
};
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    document.getElementById('app-title').textContent = translations[lang].title;
    tip.textContent = translations[lang].tip;
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
