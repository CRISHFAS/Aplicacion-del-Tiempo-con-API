const apiKey = '20136dc13fca1ddca615e9e0a3d0c878';
const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');

// Mapeo de códigos de iconos meteorológicos a nombres de clases de iconos
const weatherIconMap = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'sun',
    '02n': 'moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'water',
    '50n': 'water'
};

function fetchWeatherData(location) {
    // Construcción de la URL con el nombre de la ciudad y el API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&lang=es`;

    // Obtener los datos del clima de la API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Verifica si la respuesta de la API tiene la estructura esperada
            if (data.cod !== '200') {
                throw new Error(`No se encontraron datos para la ubicación: ${location}`);
            }

            // Actualizar la información de hoy
            const todayWeather = data.list[0].weather[0].description || 'No disponible';
            const todayTemperature = `${Math.round(data.list[0].main.temp)}°C`;
            const todayWeatherIconCode = data.list[0].weather[0].icon || '01d';

            todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('es', { weekday: 'long' });
            todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
            todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode] || 'cloud'}`;
            todayTemp.textContent = todayTemperature;

            // Actualizar la ubicación y la descripción del clima en la sección "left-info"
            const locationElement = document.querySelector('.today-info > div > span');
            locationElement.textContent = `${data.city.name}, ${data.city.country}`;

            const weatherDescriptionElement = document.querySelector('.today-weather > h3');
            weatherDescriptionElement.textContent = todayWeather;

            // Actualizar la información de hoy en la sección "day-info"
            const todayPrecipitation = `${(data.list[0].pop * 100).toFixed(0)}%`;  // Pop es un valor decimal, por eso lo multiplicamos por 100
            const todayHumidity = `${data.list[0].main.humidity}%`;
            const todayWindSpeed = `${data.list[0].wind.speed} km/h`;

            const dayInfoContainer = document.querySelector('.day-info');
            dayInfoContainer.innerHTML = `
                <div>
                    <span class="title">PRECIPITACIÓN</span>
                    <span class="value">${todayPrecipitation}</span>
                </div>
                <div>
                    <span class="title">HUMEDAD</span>
                    <span class="value">${todayHumidity}</span>
                </div>
                <div>
                    <span class="title">VELOCIDAD DEL VIENTO</span>
                    <span class="value">${todayWindSpeed}</span>
                </div>
            `;

            // Actualizar el pronóstico de los próximos 4 días
            const today = new Date();
            const nextDaysData = data.list.slice(1); // Saltamos el primer día porque es el actual

            const uniqueDays = new Set();
            let count = 0;
            daysList.innerHTML = '';
            for (const dayData of nextDaysData) {
                const forecastDate = new Date(dayData.dt_txt);
                const dayAbbreviation = forecastDate.toLocaleDateString('es', { weekday: 'short' });
                const dayTemp = `${Math.round(dayData.main.temp)}°C`;
                const iconCode = dayData.weather[0].icon || '01d';

                // Asegurarse de que el día no sea duplicado ni el día actual
                if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
                    uniqueDays.add(dayAbbreviation);
                    daysList.innerHTML += `
                        <li>
                            <i class='bx bx-${weatherIconMap[iconCode] || 'cloud'}'></i>
                            <span>${dayAbbreviation}</span>
                            <span class="day-temp">${dayTemp}</span>
                        </li>
                    `;
                    count++;
                }

                // Detener después de obtener 4 días distintos
                if (count === 4) break;
            }
        })
        .catch(error => {
            alert(`Error fetching weather data: ${error.message}`);
        });
}

// Obtener el clima cuando la página se carga para una ubicación por defecto
document.addEventListener('DOMContentLoaded', () => {
    const defaultLocation = 'Argentina';
    fetchWeatherData(defaultLocation);
});

// Botón para ingresar una nueva ubicación
locButton.addEventListener('click', () => {
    const location = prompt('Ingrese una ubicación:');
    if (!location) return;

    fetchWeatherData(location);
});

