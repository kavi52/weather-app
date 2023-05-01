import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  makeStyles,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@material-ui/core";

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

const options = { weekday: "long", day: "numeric", month: "long" };

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
    [theme.breakpoints.down("xs")]: {
      minWidth: 0,
      width: "100%",
    },
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundImage: `url('https://cdn.pixabay.com/photo/2018/05/30/00/24/thunderstorm-3440450_960_720.jpg')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    height: "95.1vh",
    color: "#fff",
    textAlign: "left",
    [theme.breakpoints.down("sm")]: {
      minHeight: "95.1vh",
      height: "100%",
    },
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 20,
    paddingBottom: 5,
    paddingLeft: 6,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
    paddingLeft: 6,
  },
  inputLabel: {
    color: "#fff",
  },
  metaInfo: {
    padding: 5,
    margin: 5,
  },
  select: {
    color: "#fff",
  },
  metaTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 0,
  },
  metaSubTitle: {
    marginTop: 3,
    color: "#dddd",
  },
  weather: {
    fontWeight: "700",
    fontSize: 60,
    [theme.breakpoints.down("xs")]: {
      fontSize: 50,
    },
  },
  card: {
    margin: 15,
    marginTop: 20,
    minWidth: 150,
    textAlign: "center",
    backgroundColor: "#00000061",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
  loadingContainer: {
    marginTop: 20,
    textAlign: "center",
  },
  weatherImage: {
    width: 160,
    [theme.breakpoints.down("sm")]: {
      width: 100,
    },
  },
}));

export const WeatherReport = () => {
  const classes = useStyles();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);

  const dayAndDate = useMemo(() => {
    return new Date(weatherData?.dt * 1000)?.toLocaleDateString(
      "en-US",
      options
    );
  }, [weatherData]);

  const handleCountryChange = async (event) => {
    const selectedCountry = event.target.value;
    setSelectedCountry(selectedCountry);

    const cities = countries.find((c) => c.country === selectedCountry).cities;
    setCities(cities);
  };

  const getWeatherDetails = (params) => {
    // Weather deatails
    axios
      .get(BASE_URL, {
        params: {
          appid: API_KEY,
          ...params,
        },
      })
      .then((response) => {
        setWeatherData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });

    // Forecast details
    axios
      .get(FORECAST_BASE_URL, {
        params: {
          appid: API_KEY,
          ...params,
        },
      })
      .then((response) => {
        const fcastData = response.data.list.slice(0, 7); // Get the first 7 forecast data for the upcoming days
        console.log(fcastData);
        setForecastData(fcastData);
      })
      .catch((error) => console.log(error));
  };

  const handleCityChange = async (event) => {
    const city = event.target.value;
    setSelectedCity(city);
    setLoading(true);
    const params = {
      q: city,
      units: "metric", // optional: set units to Celsius
    };
    getWeatherDetails(params);
  };

  useEffect(() => {
    // Get the user's current location coordinates
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // Make API request to OpenWeatherMap's API
      setLoading(true);

      const params = {
        lat: latitude,
        lon: longitude,
      };
      getWeatherDetails(params);
    });

    // Get the country list
    axios
      .get("https://countriesnow.space/api/v0.1/countries")
      .then((response) => {
        const countries = response?.data?.data;
        setCountries(countries);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className={classes.root}>
      <Grid
        container
        alignItems="center"
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.inputLabel}>Country</InputLabel>
          <Select
            className={classes.select}
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            {countries?.map((country) => (
              <MenuItem key={country.iso2} value={country.country}>
                {country.country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel className={classes.inputLabel}>City</InputLabel>
          <Select
            className={classes.select}
            value={selectedCity}
            onChange={handleCityChange}
            disabled={!selectedCountry}
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {loading ? (
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {weatherData ? (
            <>
              <Grid>
                <Typography
                  variant="h5"
                  component="h2"
                  className={classes.title}
                >
                  {weatherData?.name}, {weatherData?.sys?.country}
                </Typography>
                <Typography
                  variant="h5"
                  component="h2"
                  className={classes.subTitle}
                >
                  {dayAndDate}
                </Typography>
              </Grid>
              <Grid container direction="row">
                <Grid
                  container
                  xs={12}
                  md={6}
                  direction="row"
                  alignItems="center"
                >
                  <img
                    src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                    alt={weatherData.weather[0].description}
                    className={classes.weatherImage}
                  />
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.weather}
                    >
                      {weatherData.main.temp} &deg;
                    </Typography>
                    <Typography
                      variant="p"
                      component="p"
                      style={{
                        color: "#",
                      }}
                    >
                      {weatherData.weather[0]?.description}
                    </Typography>
                  </div>
                </Grid>

                <Grid container xs={12} md={6}>
                  <Grid item md={4} sm={2} xs={4}>
                    <p className={classes.metaTitle}>
                      {weatherData.main.temp_max} &deg;
                    </p>
                    <p className={classes.metaSubTitle}>High</p>
                  </Grid>
                  <Grid item md={4} sm={2} xs={4}>
                    <p className={classes.metaTitle}>
                      {weatherData.wind.speed} m/s
                    </p>
                    <p className={classes.metaSubTitle}>Wind</p>
                  </Grid>
                  <Grid item md={4} sm={2} xs={4}>
                    <p className={classes.metaTitle}>
                      {new Date(
                        weatherData.sys.sunrise * 1000
                      ).toLocaleTimeString()}
                    </p>
                    <p className={classes.metaSubTitle}>Sunrise</p>
                  </Grid>
                  <Grid item md={4} sm={2} xs={4}>
                    <p className={classes.metaTitle}>
                      {weatherData.main.temp_min} &deg;
                    </p>
                    <p className={classes.metaSubTitle}>Low</p>
                  </Grid>
                  <Grid item md={4} sm={2} xs={4}>
                    <p className={classes.metaTitle}>
                      {weatherData.main.humidity} %
                    </p>
                    <p className={classes.metaSubTitle}>Humidity</p>
                  </Grid>
                  <Grid item md={4} sm={2} xs={4}>
                    <p className={classes.metaTitle}>
                      {new Date(
                        weatherData.sys.sunset * 1000
                      ).toLocaleTimeString()}
                    </p>
                    <p className={classes.metaSubTitle}>Sunset</p>
                  </Grid>
                </Grid>
              </Grid>
            </>
          ) : (
            <Grid>
              <Typography
                variant="h5"
                component="h2"
                className={classes.title}
                style={{
                  textAlign: "center",
                }}
              >
                No Data Found !!!!
              </Typography>
              <Typography
                variant="h5"
                component="h2"
                className={classes.subTitle}
                style={{
                  textAlign: "center",
                }}
              >
                Please choose a city
              </Typography>
            </Grid>
          )}

          {forecastData && (
            <>
              <Typography
                variant="h5"
                component="h2"
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: "#61dafb",
                  fontWeight: 700,
                }}
              >
                Forecast
              </Typography>

              <Grid container direction="row" justifyContent="space-evenly">
                {forecastData?.map((forecast, index) => (
                  <Card key={index} className={classes.card}>
                    <CardContent>
                      <p
                        className={classes.metaSubTitle}
                        style={{
                          color: "#fff",
                        }}
                      >
                        {forecast.dt_txt}
                      </p>
                      <img
                        src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                        alt={forecast.weather[0].description}
                        style={{
                          width: 55,
                        }}
                      />
                      <p className={classes.metaSubTitle}>
                        {forecast.weather[0].description}
                      </p>
                      <p
                        className={classes.metaSubTitle}
                        style={{
                          color: "#fff",
                        }}
                      >
                        {weatherData.main.temp_max} &deg; /{" "}
                        {weatherData.main.temp_min} &deg;
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </div>
  );
};
