require('dotenv').config();
const express = require('express');
// const weather = require('./darksky.js');
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


const getYelpData = async(lat, lng) => {
    const yelpData = await request
        .get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}`)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);
    
    return yelpData.body.businesses.map(business => {
        return {
            name: business.name,
            image_url: business.image_url,
            price: business.price,
            rating: business.rating,
            url: business.url,
            // image_url: business.image_url,
            // location: business.location.address1
        };
    });

};

app.get('/reviews', async(req, res, next) => {
    try {
        
        const businessList = await getYelpData(lat, lng);
        
        res.json(businessList);
    
    } catch (err) {
        next(err);
    }
});

const getEventData = async(lat, lng) => {

    const URL = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&where=${lat},${lng}&within=25&page_size=20&page_number=1`;
    const eventData = await request.get(URL);
        
    const nearbyEvents = JSON.parse(eventData.text);

    return nearbyEvents.events.event.map(events => {
        return {
            link: events.url,
            name: events.title,
            event_date: events.start_time,
            summary: events.venue_address

        };
    });
   

};

app.get('/events', async(req, res, next) => {
    try {
        const events = await getEventData(lat, lng);

        res.json(events);
    } catch (err) {
        next(err);
    }
});


const getHikingData = async(req, res, next) => {
    const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
    const hikingData = await request.get(URL);

    const nearbyHikes = JSON.parse(hikingData.text);

    return nearbyHikes.trails.map(hikes => {
        return {
            name: hikes.name,
            location: hikes.location,
            length: hikes.length,
            stars: hikes.stars,
            star_votes:hikes.starVotes,
            summary: hikes.summary,
            trail_url: hikes.url,
            conditions: hikes.conditionDetails,
            condition_date: hikes.conditionDate,
            condition_time: hikes.conditionTime
            
        };
    });
};

app.get('/trails', async(req, res, next) => {
    try {
        const hikes = await getHikingData(lat, lng);

        res.json(hikes);
    } catch (err) {
        next(err);
    }
});