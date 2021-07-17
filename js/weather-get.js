import API from '../API.json';

const API_KEY = API["weather-api-key"];

export {Weather}

class Weather {
    static #relevantForecastInfo = ['dt', 'clouds', 'feels_like', 'humidity', 'temp', 'rain', 'weather', 'wind_speed'];

    static async getWeather(city) {
        const weather = await this.#getWeather(city);
        if (weather.ok === false) return {ok: false, error: weather.error};

        const currentWeather = weather.current;
        this.#processWeather(currentWeather);

        const hourlyWeather = this.#processWeatherArray(weather.hourly);
        const [todayWeather, tomorrowWeather] = this.#splitHourlyWeather(hourlyWeather);

        const dailyWeather = this.#processWeatherArray(weather.daily);

        return {currentWeather, todayWeather, tomorrowWeather, dailyWeather, city};
    }

    static async #getWeather(city) {
        const coords = await this.#getCoord(city);

        if (coords.ok === false) return {ok: false, error: coords.error};

        const [latitude, longitude] = coords;
        const url = this.#createWeatherURL("onecall", {latitude, longitude});
        const response = await fetch(url);
        const weather = await response.json();
        return weather;
    }

    static async #getCoord(city) {
        const url = this.#createWeatherURL("weather", city);
        const response = await fetch(url);

        if (!response.ok) return {ok: false, error: new Error("City not found")};

        const weather = await response.json();
        const coord = [weather.coord.lat, weather.coord.lon];
        return coord;
    }

    static #processWeatherArray(weatherArray) {
        weatherArray.forEach((weatherForecast) => {
            this.#processWeather(weatherForecast);
        });
        return weatherArray;
    }

    static #processWeather(weatherForecast) {
        this.#processDate(weatherForecast);
        this.#processRelevantInfo(weatherForecast, this.#relevantForecastInfo);
        this.#getWeatherDescription(weatherForecast);
    }

    static #splitHourlyWeather(hourlyWeatherArray) {
        const forecastForCurrentHour = hourlyWeatherArray[0];
        const currentHour = +(forecastForCurrentHour.dt.match(/\d{2}(?=:)/)[0]);
        const hoursLeftToday = 23 - currentHour;
        const hoursOfTomorrow = hoursLeftToday + 24;
        const todayWeather = hourlyWeatherArray.filter((element, index) => {
            return index <= hoursLeftToday;
        });
        const tomorrowWeather = hourlyWeatherArray.filter((element, index) => {
            return (index > hoursLeftToday && index <= hoursOfTomorrow);
        });
        return [todayWeather, tomorrowWeather];
    }

    static #processDate(weatherForecast) {
        let date = new Date();
        date.setTime(weatherForecast.dt * 1000);
        weatherForecast.dt = date.toDateString() + " " + date.toLocaleTimeString().replace(/:\d+$/, "");
    }

    static #processRelevantInfo(object, relevantInfo) {
        Object.keys(object).forEach((key) => relevantInfo.includes(key) || delete object[key]);
    }

    static #getWeatherDescription(weatherForecast) {
        // chooses primary weather description out of several
        // and merges description object with forecast object
        weatherForecast.weather = weatherForecast.weather[0];
        weatherForecast.description = weatherForecast.weather.description;
        weatherForecast.icon = `http://openweathermap.org/img/wn/${weatherForecast.weather.icon}@2x.png`;
        delete weatherForecast.weather;
    }

    static #createWeatherURL(apiMethod, location) {
        let url = new URL(`https://api.openweathermap.org/data/2.5/${apiMethod}`);
        if (typeof location === "string") url.searchParams.set("q", location);
        if (typeof location === "object") {
            url.searchParams.set("lat", location.latitude);
            url.searchParams.set("lon", location.longitude);
        }
        url.searchParams.set("appid", API_KEY);
        url.searchParams.set("units", "metric");
        return url;
    }


}
