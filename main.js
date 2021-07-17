import {Weather} from "./js/weather-get";
import "./css/styles.css"
import {Location} from "./js/location-get";

//console.log(await Location.getLocation());


let currentWeatherDisplay = document.querySelector("#current-weather");
let dd = currentWeatherDisplay.querySelectorAll("[data-weather-id]");

(async () => {
    try {
        let weather = await Weather.getWeather('Moscow');

        if (weather.ok === false) throw weather.error;

        let currentWeather = weather.currentWeather;
        console.log(weather);
        dd.forEach((node) => {
            node.textContent = currentWeather[node.dataset.weatherId];
            if (node.dataset.weatherId === 'icon') node.src = currentWeather[node.dataset.weatherId];
            if (node.dataset.weatherId === 'city') node.textContent = weather.city;
            if (currentWeather[node.dataset.weatherId] === undefined && node.dataset.weatherId === 'rain') node.parentElement.classList.toggle('hidden');
        })

    } catch (error) {
        console.log(error);
        currentWeatherDisplay.textContent = error;
    } finally {
        currentWeatherDisplay.classList.toggle("opacity-100");
    }

})();