/*load all the elements as const */
//Units: Celcius & Fahrenhiets 
const ddlUnits = document.querySelector("#ddlUnits"); /*dropdown units*/

// address & date 
const dvCityCountry = document.querySelector("#dvCityCountry"); /*city & country name */
const dvCurrDate = document.querySelector("#dvCurrDate"); /*current date */

// Current Temperature 
const dvCurrTemp = document.querySelector("#dvCurrTemp"); /*current temperature */

// Cuurent Condition: Feels like, Humidity, Wind, Precipitation
const pFeelsLike = document.querySelector("#pFeelsLike"); /*Feels Like */
const pHumidity = document.querySelector("#pHumidity"); /*Humidity */
const pWind = document.querySelector("#pWind"); /*Wind */
const pPrecipitation = document.querySelector("#pPrecipitation"); /*Precipitation */


//variables for locations (use let coz will be changing city & country names)
let cityName, countryName;


async function getGeoData() {
    let search = "london, england";

    /*will use string template literals for our url so will use bacltick `` instead of double quotes for url, 
    coz by using backticks, it will enable us to load the value of our search variable
    in this string and will do that by using $ sign with curly brackets ${} and 
    add the name of our vriable search.
     */
    // were getting data from this url
    //addressdetails : 0 or 1. when set to 1, includes breakdown of address into elements.
    const url = `https://nominatim.openstreetmap.org/search?q=${search}}&format=jsonv2&addressdetails=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        /* will get lat and lon from here.
        latitude and logitude is in first item of array index 0 
        so, result which is whole array and 
        first result of that array which is at index 0,
        so square bracket and zero result[0]*/
        let lat = result[0].lat;
        let lon = result[0].lon;

        loadLocationData(result);
        getWeatherData(lat, lon); //if response is sucessfull then call getWeatherData()
        
    } catch (error) {
        console.error(error.message);
    }
}


//load location data with location
function loadLocationData(locationData) {
    /*load the entire object which will be the result
      load as variable 
      the first item dot address. so locationData will be our object **/
    let location = locationData[0].address;

    /*save the city name as location
     location will be index 0, address, and then we can get into fields.*/
    cityName = location.city;
    countryName = location.country_code.toUpperCase(); //upper case for country code

    //use options argument to customise date & time formats
    let dateOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long"
    };
    let date = new Intl.DateTimeFormat("en-UK", dateOptions).format(new Date());

   
    //test tp see if we get location,
    console.log(cityName, countryName, date);

    /*update the UI
      textContent property used to access or modify the content of an HTML element. 
      will use template literals coz we want to use comma 
      for writing cityname and country name like London, England*/
    dvCityCountry.textContent = `${cityName}, ${countryName}`;
    dvCurrDate.textContent = date;
}


async function getWeatherData(lat, lon) {
    /**
     temperature_unit = fahrenheit OR celsius
     wind_speed_unit = mph or kmh 
     precipitation_unit = inch OR mm
     */
    // it will be declared as celcius in metric system and
    //  when we select fehreneit it will change
    // default will be celcius
    let tempUnit = "celsius";
    let windUnit = "mph";
    let precipUnit = "mm";
    // if toggle value = F
    if (ddlUnits.value === "F") {
        tempUnit = "fahrenheit";
        windUnit = "kmh";
        precipUnit = "inch"; 
    }
   
    /*will use string template literals for our url so will use bacltick `` instead of double quotes for url, 
    coz by using backticks, it will enable us to load the value of our search variable
    in this string and will do that by using $ sign with curly brackets ${} and 
    add the name of our vriable search.
*/
    // were getting data from this url

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&wind_speed_unit=${windUnit}&temperature_unit=${tempUnit}&precipitation_unit=${precipUnit}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        //console.log(result);

        //new function for current weather temperature and result will be the parameter
        loadWeatherData(result); 
    } catch (error) {
        console.error(error.message);
    }
}

//current temperature function
function loadWeatherData(weather) {
    //check if its loaded
    console.log(weather);
    /* will get current temp div and use textContent property
     and use our weather parameter to get current temperature.
     will get the current temperature from API calls (latitude & longitude)
    in current field called apparent_temperature. 
    
    We dont have to use template literal here for few of 'em coz 
    we've added the degrees inside the HTML.
    we have already added an 'id dvCurrTemp' in html <span> tag, 
    and were targeting that from here`.
    
    To remove the decimal from our temperature use Math.round()*/
    dvCurrTemp.textContent = Math.round(weather.current.temperature_2m);
    
    //load cuurent conditions feels like
    pFeelsLike.textContent = Math.round(weather.current.apparent_temperature);
    //humidity
    pHumidity.textContent = weather.current.relative_humidity_2m;
    /*Wind
     will be using template literal for Wind coz were adding a symbol or
     were joining this variables with space between them 
     so first will get 'wind_speed_10m' from 'current' field which will display a number and 
     then create another template literal 
     and then to display km/h or mp/h will get 'wind_speed_10m' from 'current_unit' field.
     
     will also use a replace() method to remove character from string
     basically to remove slash from mp/h 
     so we replace "mp/h" with "mph"
     and math.round() to remove decimal point*/
    pWind.textContent = `${Math.round(weather.current.wind_speed_10m)} ${weather.current_units.wind_speed_10m.replace("mp/h", "mph")}`;

    /*Precipitation
     we added a replace() method for current_units precipitation to change "inch" with "in" coz 
     if user select fahrenheit as Unit, then we want it to display "in" instead of "inch" for Precipitation. */
    pPrecipitation.textContent = `${weather.current.precipitation} ${weather.current_units.precipitation.replace("inch", "in")}`;


}
getGeoData();



