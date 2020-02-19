const express = require('express');
const data = require('./geo.js');
const weather = require ('./darksky.js');
const app = express();
const cors = require('cors');
const request = require('superagent');

app.use(cors());

// initalize the global state of lat and long so it is accessible in other routes
let lat;
let lng;

app.get('/location', (request, respond) => {
    const location = request.query.search;
    console.log('using location ...', location);

    const cityData = data.results[0];
    
    // update the global state of lat and long so that it is acceptable in other routes
    let lat = cityData.geometry.location.lat;
    let lng = cityData.geometry.location.lng;

    respond.json({
        formatted_query: cityData.formatted_address,
        latitude: cityData.geometry.location.lat,
        longitude: cityData.geometry.location.lng
    });
});


const getWeatherData = (lat, lng) => {
    return weather.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000)
        };
    });
};


app.get('/weather', (req, res) => {
    // use the lat and lng from earlier to get weather data for the selected area 
    const portlandWeather = getWeatherData(lat, lng);


    // res.json that weather data in the appropriate form
    res.json(portlandWeather);
});


const cityData = data.results[0];
app.listen(3000, () => { console.log(cityData)})