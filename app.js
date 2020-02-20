require('dotenv').config();
const express = require('express');
const weather = require('./darksky.js');
const request = require('superagent');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3005;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.use(cors());

app.get('/', (request, respond) => respond.send('Jello World!'));


// initalize the global state of lat and long so it is accessible in other routes
let lat;
let lng;

app.get('/location', async(req, respond, next) => {
    try {

        const location = req.query.search;
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;
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


const getWeatherData = async(lat, lng) => {
    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`);

    return weather.body.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000),
        };
    });
} ;
app.get('/weather', async(req, res, next) => {
    // use the lat and lng from earlier to get weather data for the selected area
    try {
        const portlandWeather = await getWeatherData(lat, lng);
        
        // res.json that weather data in the appropriate form
        res.json(portlandWeather);
    } catch (err) {
        next(err);
    }
});

const getYelpData = async

app.get('/yelp', async(req, res, next) => {
    try {
        const yelpData = await getYelpData()
    }
})