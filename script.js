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
        //console.log(result);
        /* will get lat and lon from here.
        latitude and logitude is in first item of array index 0 
        so, result which is whole array and 
        first result of that array which is at index 0,
        so square bracket and zero result[0]*/
        let lat = result[0].lat;
        let lon = result[0].lon;

        loadLocationData(result);
        getWeatherData(lat, lon); //if response is sucessfull then call getWeatherData()
        loadHourlyForecast();

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
        weekday: "long",
    };
    /* used International date time format for internationalisation*/
    let currDate = new Intl.DateTimeFormat("en-US", dateOptions).format(new Date());

    //test tp see if we get location,
    //console.log(cityName, countryName, date);

    /*update the UI
      textContent property used to access or modify the content of an HTML element. 
      will use template literals coz we want to use comma 
      for writing cityname and country name like London, England*/
    dvCityCountry.textContent = `${cityName}, ${countryName}`;
    dvCurrDate.textContent = currDate; //Intl.DateTimeFormat
}

/*will get all the weather data from the API
using getWeatherData() function and load the result in
loadCurrentWeather() and loadDailyForecast() functions*/ 
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
        console.log(result); //API weather data

        /*new function for current weather temperature and result will be the parameter
          when we get the result from API, using our getWeatherData() function
           we load the weather data result in our loadCurrentWeather() function*/
        loadCurrentWeather(result);  
        loadDailyForecast(result); //get weather, daily forecast data from api and load result in loadDailyForecast() function.
    } catch (error) {
        console.error(error.message);
    }
}

//current temperature function
function loadCurrentWeather(weather) {
    //check if its loaded
    //console.log(weather);
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


/** we need to loop through our daily forecast data
 * go through our api call which is our weather object
 * and we've already used current and current_units, 
 * so now will use daily for daily forecast.
 */
/*daily forecast data, use weather as parameter.
  this function will load the weather result */
function loadDailyForecast(weather) {
    //load all the days from weather API 'daily' object.
    let daily = weather.daily;
    /*loop through 'daily' data. 
       will use for loop
       API daily object contains temperature_2m_max and temperature_2m_min, time, weather_code
       we might use index coz we need to get the
       first item in each of the temperature_2m_max and temperature_2m_min, time, weather_code

       for 7 days it goes from 0 to 6 and then increment it

       in loop: convert the date object after getting from
        API daily obejct -  time field.
        so convert the date format to display the only days 
    */
    //for loop
    for (let i = 0; i < 7; i++) {
        
            /*get time field and index of i
            so this will start from 0 and goes to 6 
            and convert the dates to Date(),
            however for the purpose of internationalisaton, use international date time format -
            Intel.DateTimeFormat() with options paramter instead*/

        let date = new Date(daily.time[i]);
        let dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
        let dvForecastDay = document.querySelector(`#dvForecastDay${i + 1}`); //i + 1 is only for div's.
        /* Load the actual Image File Path
        will replace the actual rain image icon name with the weather code 
            weill use getWeatherCodeName() function coz thats where we have stored the weather codes.
            API call - daily - weather_code*/
        let weatherCodeName = getWeatherCodeName(daily.weather_code[i]);

        /*load the content which is the 3rd parameter for daily__day-temps,
        weather API - daily - temperature_2m_max and index to get the temp degrees 
        and add degree symbol as a string
        we also use Math.round() for temp degrees to remove the decimal points*/
        let dailyHigh = Math.round(daily.temperature_2m_max[i]) + "°"; // we dont use i + 1 here coz when we pulling data, we start it from index 0.
        /*dailyLow
        weather API - daily - temperature_2m_min and index */
        let dailyLow = Math.round(daily.temperature_2m_min[i]) + "°";


        /*Test:
            //console.log(date); //outputs whole date with with days time
            //console.log(new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)); //outputs just the days as shorthand like Monday as Mon coz we used "short" format.   
            //console.log(dayOfWeek); //outputs 7 days like Thu Fri... starting from current day*/

        /* dynamically generate p.daily__day-title.
        so will create a paragraph and insert it into element.*/
        
        /* Add content
            tag is "p", className is "daily__day-title", 
            content is dayOfWeek, parentElement is dvForecastDay, position is "afterbegin".
            we used "afterbegin" (before its first child) to create paragraph inside the forecast.
            we call addDailyElement() function in this loadDailyForecast() function.
            Refer to MDN doc: insertAdjacentElement() for "afterbegin" and "beforend".
            
            //the empty string will load the file path to load image 
        */
        addDailyElement("p", "daily__day-title", dayOfWeek, "", dvForecastDay, "afterbegin");
        /* img tag
            same for this aswell but, the img tag doesnt need content, 
            so will just add an empty string "" for that, 
            and will add image file path beside that which contains our image file source path,
            and instead of "afterbegin", will use "beforeend" (after the last child) 
            which in this case would just be after the paragraph. 
        */
        addDailyElement("img", "daily__day-icon", "", weatherCodeName, dvForecastDay, "beforeend"); 
        /* For our empty string will create a condition in addDailyElement() function so:
            if content is an empty string then it wont add the textNode here. */

        /* will create a div for daily__day-temps
        tag is div, className is daily__day-temps, content and weatherCodeName will be empty string, 
        parentElement will be dvForecastDay and position will be beforeend */
        addDailyElement("div", "daily__day-temps", "", "", dvForecastDay, "beforeend");

        /*create the p tag for daily__day-temps div as variable. 
        This will run after the div daily__day-temps is created. 
        we have also added #dvForecastDay${i + 1} which adds the temperature degrees for all 7 days,
        coz without that it just finds the first daily day temps and
        we run into issue where all the temp degrees gets displayed within the first block which is the current day*/
        let dvDailyTemps = document.querySelector(`#dvForecastDay${i + 1} .daily__day-temps`);

        /*will add paragraph inside the div daily__day-temps. 
        And append the paragaraph to dvDailyTemps. And the class will be daily__day-high
        And the content wiill be dailyHigh and weatherCodeName will be an empty string */
        addDailyElement("p", "daily__day-high", dailyHigh, "", dvDailyTemps, "afterbegin");

        //daily__day-low paragraph. so this paragraph will be after daily__day-high class
        addDailyElement("p", "daily__day-low", dailyLow, "", dvDailyTemps, "beforeend");
    }
}

/* Create a helper function for other daily elements 
   and name them tag, className, content and parentElement
   Refer to MDN doc: createElement() Method
   also added weatherCodeName to load image icon and alt text for image.
   */
function addDailyElement(tag, className, content, weatherCodeName, parentElement, position) {
    // create a new div element
    const newElement = document.createElement(tag);
    //class
    newElement.setAttribute("class", className);

    /*addDailyElement() call function in loadDailyForecast() contains empty string for content
     which is the dayOfWeek which we do not need for our img tag */
    if (content !== "") {
        // we want to create a text node and below this will append the child aswell
        const newContent = document.createTextNode(content); // and give the newly created div element some content
        //and append the child
        newElement.appendChild(newContent); // add the text node to the newly created div
    }
    //load the img source file which will be the image file name that will be generated.
    if (tag === "img") {
        newElement.setAttribute("src", `/assets/images/icon-${weatherCodeName}.webp`);
        //addweatherCodeName in the alt text for img
        newElement.setAttribute("alt", weatherCodeName);
        //set width & height of the img
        newElement.setAttribute("width", "320");
        newElement.setAttribute("height", "320");
    }

    // add the newly created element and its content into the DOM
    parentElement.insertAdjacentElement(position, newElement);
}

/* Hourly forecast
    Have the ability to choose the day which will give us the hourly forecast.
    Will start pulling all the data we need for the hourly forecast.

    will add loops:
    One loop will be outer loop: which will loop through days
    And in that loop, will have another loop to loop through the hourly data.
 */
function loadHourlyForecast() {

    /* the API weather data has a date format: 2026-05-27T00:00
    // so will use the same date format: 2026-05-27T00:00 to customise our date.*/

    //use options argument to customise date & time formats
    let dateOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        
    };

    /*Add days to date
        use for loop */
    for (let i = 0; i < 7; i++) {
        /*create new date everytime
            so by declaring the current date (currDate) as today's date (new Date()), 
            every loop it will make sures the current date doesnt change*/
        let currDate = new Date();
        /*loop through the dates
         the 'setDate()' method of Date instances 'changes the day of the month'
          for this date according to local time. 
          in setDate() we need to add current date and date of the current date plus i to get the correct days
          this will change the value of current date*/
        currDate.setDate(currDate.getDate() + i);
        //Test
        //console.log(currDate); //test whole date with time
        //console.log(new Intl.DateTimeFormat("en-US", dateOptions).format(currDate)); //currentDate //test days working 

        /* padstart: 
        padding (filling up a string with another character sequence or string) 
        a string with another string to date format.
        so, pad a single digit value with additional 0 in beginning 
        and the date format will remain same.
    
        Also added toString():
        to return a string representing a number value,
        coz padStart doesnt returns a string,
        so need to convert it to a string    */
        let year = currDate.getFullYear().toString();
        let month = currDate.getMonth().toString().padStart(2, "0");
        let date = currDate.getDate().toString().padStart(2, "0");
        console.log(`${year} - ${month} - ${date}`);
    }



}



//will use this function() for the image alt text
/*update weather icons:*/
function getWeatherCodeName(code) {
    /*check weather variable documentation for 
    Weather interpretion codes on open-meteo site
        sunny -    0 
        partly-cloudy - 1, 2
        overcast - 3
        fog -     45, 48
        drizzle - 51, 53, 55, 56, 57 
        rain -     61, 63, 65, 66, 67, 80, 81, 82
        snow -     71, 73, 75, 77, 85, 86
        storm -    95, 96, 99 */
    /*create a table, and if we get code number 51, 
      return icon.drizzle.webp (icon file name)
      so any of the drizzle code numbers should return drzzile */
    //create object
    const weatherCodes = {
        //store
        0 : "sunny",
        1 : "partly-cloudy",
        2 : "partly-cloudy",
        3 : "overcast",
        45 : "fog",
        48 : "fog",
        51 : "drizzle",
        53 : "drizzle",
        55 : "drizzle",
        56 : "drzzle",
        57 : "drizzle",
        61 : "rain",
        63 : "rain",
        65 : "rain",
        66 : "rain",
        67 : "rain",
        80 : "rain",
        81 : "rain",
        82 : "rain",
        71 : "snow",
        73 : "snow",
        75 : "snow",
        77 : "snow",
        85 : "snow",
        86 : "snow",
        95 : "storm",
        96 : "storm",
        99 : "storm",
    };
    // this will just return the description here.
    return weatherCodes[code];
}

getGeoData();

//console.log(getWeatherFilePath(1)); //call getWeatherFileName(code) 


// get a whole date and pull a day out of that