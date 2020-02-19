require('dotenv').config();
const express = require('express');
const data = require('./geo.js');
const weather = require ('./darksky.js');
const app = express();
const cors = require('cors');
const request = require('superagent');

app.use(cors());

// app.use((req, res, next) => {
//     console.log(req);
//     next();
// });


// initalize the global state of lat and long so it is accessible in other routes
let lat;
let lng;

app.get('/location', async(req, respond, next) => {
    try {

        const location = req.query.search;
        const URL = (`GET https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`);
        console.log('using location ...', location);

        const cityData = await request.get(URL);

        const firstResult = cityData.body[0];

        // update the global state of lat and long so that it is acceptable in other routes
        lat = firstResult.lat;
        lng = firstResult.lon;

        respond.json({
            formatted_query: firstResult.display_name,
            latitude: lat,
            longitude: lng
        });
    } catch (err) {
        next(err);
    }
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


