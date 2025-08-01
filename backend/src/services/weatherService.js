class WeatherService {
    static async getWeatherForCoordinates(coordinates) {
        const weatherData = await Promise.all(
            coordinates.map(async ({ lat, lng }) => {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,rain,showers,wind_gusts_10m,weather_code&past_days=2&forecast_days=1`
                );
                const data = await response.json();

                return {
                    lat,
                    lng,
                    weather: data
                };
            })
        );

        return weatherData;
    }
}

export default WeatherService;