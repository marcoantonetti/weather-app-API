const express = require("express");
const cors = require("cors");
const exampleData = require("./example.json");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const { lat, lon } = req.query;
  
  // My API_KEY for openweathermap has expired. So I created a mock data on example.json. 
  
  // Local data
  // Comment this if you use the API call
  res.json({
    current: parseCurrentWeather(exampleData),
    daily: parseDailyWeather(exampleData),
    hourly: parseHourlyWeather(exampleData),
  })

  // API call
  // axios
  //   .get("https://api.openweathermap.org/data/3.0/onecall", {
  //     params: {
  //       lat,
  //       lon,
  //       appid: process.env.API_KEY,
  //       units: "imperial",
  //       exclude: "minutely,alerts",
  //     },
  //   })
  //   .then(({ data }) => {
  //     console.log("Api worked");
  //     res.json({
  //       current: parseCurrentWeather(data),
  //       daily: parseDailyWeather(data),
  //       hourly: parseHourlyWeather(data),
  //     });
  //   })
  //   .catch((e) => {
  //     console.log("ERROR GETTING API", e);
  //     res.sendStatus(500);
  //   });
});

function parseCurrentWeather({ current, daily }) {
  const { temp: currentTemp, weather, wind_speed } = current;
  const { pop, temp, feels_like } = daily[0];

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(temp.max),
    lowTemp: Math.round(temp.min),
    highFeelsLike: Math.round(Math.max(...Object.values(feels_like))),
    lowFeelsLike: Math.round(Math.min(...Object.values(feels_like))),
    windSpeed: Math.round(wind_speed),
    precip: Math.round(pop * 100),
    icon: weather[0].icon,
    description: weather[0].description,
  };
}

function parseDailyWeather({ daily }) {
  return daily.slice(1).map((day) => {
    return {
      timestamp: day.dt * 1000,
      icon: day.weather[0].icon,
      temp: Math.round(day.temp.day),
    };
  });
}

const HOUR_IN_SECONDS = 3600;
function parseHourlyWeather({ hourly, current }) {
  return hourly
    .filter((hour) => hour.dt > current.dt - HOUR_IN_SECONDS)
    .map((hour) => {
      return {
        timestamp: hour.dt * 1000,
        icon: hour.weather[0].icon,
        temp: Math.round(hour.temp),
        feelsLike: Math.round(hour.feels_like),
        windSpeed: Math.round(hour.wind_speed),
        precip: Math.round(hour.pop * 100),
      };
    });
}

const port = process.env.PORT ?? 3001;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}!!!`);
});
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
