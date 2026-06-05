/*load all the elements as const */
//Units: Celcius & Fahrenhiets 
const ddlUnits = document.querySelector("#ddlUnits"); /*dropdown units*/
const ddlDay = document.querySelector("#ddlDay"); /*dropdown days for hourly forecast*/

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


//variables for locations (use let coz will be changing city, country names & weather data)
// we have declared weatherData globally, so we won't have to pass as weatherData as parameter in functions.
let cityName, countryName, weatherData;


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

/*will get all the weatherData data from the API
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

        //instead of const result, will add weatherData, so will it to change the value of the weatherData data
        weatherData = await response.json();
        console.log(weatherData); //API weatherData data

        /*new function for current weatherData temperature and result will be the parameter
          when we get the result from API, using our getWeatherData() function
           we load the weatherData data result in our loadCurrentWeather() function*/
        loadCurrentWeather(weatherData);  
        loadDailyForecast(weatherData); //get weatherData, daily forecast data from api and load result in loadDailyForecast() function.
        loadHourlyForecast(weatherData); //will run it first when we load all the data
        
    } catch (error) {
        console.error(error.message);
    }
}

//current temperature function
function loadCurrentWeather() {
    //check if its loaded
    //console.log(weatherData);
    /* will get current temp div and use textContent property
     and use our weatherData to get current temperature.
     will get the current temperature from API calls (latitude & longitude)
    in current field called apparent_temperature. 
    
    We dont have to use template literal here for few of 'em coz 
    we've added the degrees inside the HTML.
    we have already added an 'id dvCurrTemp' in html <span> tag, 
    and were targeting that from here`.
    
    To remove the decimal from our temperature use Math.round()*/
    dvCurrTemp.textContent = Math.round(weatherData.current.temperature_2m);
    
    //load cuurent conditions feels like
    pFeelsLike.textContent = Math.round(weatherData.current.apparent_temperature);
    //humidity
    pHumidity.textContent = weatherData.current.relative_humidity_2m;
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
    pWind.textContent = `${Math.round(weatherData.current.wind_speed_10m)} ${weatherData.current_units.wind_speed_10m.replace("mp/h", "mph")}`;

    /*Precipitation
     we added a replace() method for current_units precipitation to change "inch" with "in" coz 
     if user select fahrenheit as Unit, then we want it to display "in" instead of "inch" for Precipitation. */
    pPrecipitation.textContent = `${weatherData.current.precipitation} ${weatherData.current_units.precipitation.replace("inch", "in")}`;


}


/** we need to loop through our daily forecast data
 * go through our api call which is our weatherData object
 * and we've already used current and current_units, 
 * so now will use daily for daily forecast.
 */
/*daily forecast data.
  this function will load the weatherData result */
function loadDailyForecast() {
    //load all the days from weatherData API 'daily' object.
    let daily = weatherData.daily;
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
        //individual days
        let dvForecastDay = document.querySelector(`#dvForecastDay${i + 1}`); //i + 1 is only for div's. 
        /* Load the actual Image File Path
        will replace the actual rain image icon name with the weatherData code 
            weill use getWeatherCodeName() function coz thats where we have stored the weatherData codes.
            API call - daily - weather_code*/
        let weatherCodeName = getWeatherCodeName(daily.weather_code[i]);

        /*load the content which is the 3rd parameter for daily__day-temps,
        weatherData API - daily - temperature_2m_max and index to get the temp degrees 
        and add degree symbol as a string
        we also use Math.round() for temp degrees to remove the decimal points*/
        let dailyHigh = Math.round(daily.temperature_2m_max[i]) + "°"; // we dont use i + 1 here coz when we pulling data, we start it from index 0.
        /*dailyLow
        weatherData API - daily - temperature_2m_min and index */
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

//Hourly forecast Elements
/* Create a helper function for other hourly elements 
   and name them tag, className, content and parentElement
   Refer to MDN doc: createElement() Method
   also added weatherCodeName to load image icon and alt text for image.
   */
function addHourlyElement(tag, className, content, weatherCodeName, parentElement, position) {
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

    will add loop:
    which will loop through the hourly data.

    will loadHourlyForecast()pull weatherData in loadHourlyForecast to pull our data.
   
 */
function loadHourlyForecast() {
    console.log("loadHourlyForecast()");

    /* Declared dayIndex variable for hourly-forecast drop down list
    which will allow user to select the days they want to load the forecast for.
    so by default the dayIndex value will be 0.
    and by default it will load the first day which is the current day.
    next: 
        when everytime the drop down list changes (like if user select other day)
        than will re-reun loadHourlyForecast for that day.
        and add a listener event to the select tag

        we have added parseInt coz, without it our day was getting concatenate as a string
        coz we were doing dayIndex + 1, for example, for day 2 it was doing Day 21, day 3 - day 31
        so it was joining the string like 2+1, 3+1 and it was giving day21 or day 31.
        so we used parseInt() method to change the string into int.
        so our string is ddllDay.value and 10 is radix parameter of parseInt 
        
        off Topic:
        The parseInt method parses a value as a string and returns the first integer
        A radix parameter specifies the number system to use:
        2=binary, 8=octal, 10=decimal, 16=hexadecimal
     */
    let dayIndex = parseInt(ddlDay.value, 10); //parseInt is used to change string to int

    /* the API weatherData data has a date format: 2026-05-27T00:00
    // so will use the same date format: 2026-05-27T00:00 to customise our date.*/

    //Pseudo code on how to load the data to get the format for time.
    // for each of the 7 days, need to retrieve the 23 hours indexes
    //Day 1 , Hours: 0-23  //0+23 is 23  -- dayIndex=0
    //Day 2, Hours: 24-47 //24+23 is 47 -- dayIndex=1
    //Day 3, Hours: 48-71 //48+23 is 71 -- dayIndex=2
    //Day 4, Hours: 72-95 //72+23 is 95
    //Day 5, Hours: 96-119 //96+23 is 119
    //Day 6, Hours: 120-143 //120+23 is 143
    //Day 7, Hours: 144-167 //144+23 is 167
    //and in our weatherData api call, in our hourly object field we got total 168 arrays for time, temperature and weatherData code.
    //we can use these indexes to pull from each one. so if we have starting hour index then we can add 23 to that for each day
    // and this will be simpler than trying to convert data from an object.
    // And this is what we really need in order to retrieve the correct hourly data.

    //console.log(weatherData);

    /*Add days to date*/
    /*By default it will load the first day which is the current day*/
    

        /*Test
            console for each of the 7 days and + 1 will count from Day 1 and output till Day 7 instead of Day 6.*/
        console.log(`Day ${dayIndex + 1}`);

        //First Hour -- 24 * 0
        let firstHour = 24 * dayIndex;

        //Last Hour -- 24 * (0 + 1) - 1
        let lastHour = 24 * (dayIndex + 1) - 1;

        /*we get this from our weatherData api 'getWeatherData()': 
            so, weatherData - hourly object - weather_code (weather_code will return array) */
        let weatherCodes = weatherData.hourly.weather_code;

        //weatherData api : weatherData - hourly object - temperature_2m (retturns array)
        let temps = weatherData.hourly.temperature_2m;

        //hours variable to pull time from hourly weatherData data API
        let hours = weatherData.hourly.time; 

        /*So will not declare the id inside the loop. 
            will just redeclaring it as one (1) every single time. */
        let id = 1;

        /* now we need to figure out what the hours are ging to be ?
            on mockup design its 3pm, 4pm etc.
            will start from midnight 12:00am.
            and will need another for loop inside our for loop to display the hour.
            right now were getting the data for the whole day which is 24hour of data.
            and now we need to loop through the hours of the day for each day.
            
            we've added "=" synbol beside less than, as that will display 24 hours, as
            earlier with no 'equal to symbol' it was only displaying 23 hours which is till 11pm*/
        for (let h = firstHour; h <= lastHour; h++) {
            //
            
           /*Test
                for each of the 7 days, it will console log 24 hours. (numbers)
                this should show: Day 1: start from 0 and and goes till 23, Day 2: 24 - 47. and so on.
                so our hourly loop is working now*/
            //console.log(`hour = ${h}`); //this will output everything.

            let weatherCodeName = getWeatherCodeName(weatherCodes[h]);
            let temp = Math.round(temps[h]) + "°";
            /** hours[h] will pull the time from hourly weatherData data API
                we'll  convert this 2026-05-30T00:00 date time string to a date object.
                then format the hour.
                And to do that will use new Date()
                to fomrat it to large string of numbers, 
                it wil display the full date and time like this: Sat May 30 2026 00:00:00 GMT+0100 (British Summer Time)

                Refer to MDN - Get Date, Time and Hour
                we want to go from date object to string of the hours.
                Next fomrat datetime hours am and pm 
                so, we'll use toLocaleString() method which returns a Date object as a string using Locale settings.
             */
            let hour = new Date(hours[h]).toLocaleString('en-US', { hour: 'numeric', hour12: true });

            /*'hour' will get date and time, So for each hour, 
                it will diplay date and time(hour): 2026-05-30T00:00
                weatherCode will show the codes like for sunny, rainy, so: 2,1,3,0,51
                and temp will get the tempearatures : 21.2, 18.8, 17
                all together like this: 2026-05-30T00:00 2 20.3
             */
            //console.log(hour, weatherCodeName, temp); 

            //individual hours
            let dvForecastHour = document.querySelector(`#dvForecastHour${id}`);
            //console.log(`#dvForecastHour${id}`); //generate forecast hour ids for all days
            /*Test
                console.log(dvForecastHour); //generates div elements for hourly forecast
                like this: <div id="dvForecastHour2" class="hourly__hour"></div>*/

            /*remove all the dvForecastHour child 
                (otherwise it will duplicate the icons, hours and temperature) */
            while (dvForecastHour.firstChild) {
                dvForecastHour.removeChild(dvForecastHour.firstChild);
                //console.log("remove child");
            }

            /* generate the markup
                dynamically generate p.daily__day-title.
                so will create a paragraph and insert it into element.
                add daily element to forecast hour*/
            addDailyElement("img", "hourly__hour-icon", "", weatherCodeName, dvForecastHour, "afterbegin"); 
            addDailyElement("p", "hourly__hour-time", hour, "", dvForecastHour, "beforeend");
            addDailyElement("p", "hourly__hour-temp", temp, "", dvForecastHour, "beforeend");
            console.log(`#dvForecastHour${h + 1}`);

            /*for every loop the id will be incremented.
                and we have declared the id outside the for loop.*/
            id++;


            /*console.log(weatherCodes[h], temps[h]);
                this should output the same weathercode_arrays for all the 7 days,
                as we normally have in our weatherData data API.
                and tempearature */
            //console.log(weatherCodes[h], temps[h]);

           //we also get the temperature
        }

        //we need to get the hour
        // weatherData code 
        // temperature

        /*Test
        get the indexes (first hour & last hour)
        what will get in console is:
        were looping through each day.
        For each day will get, the first hour and the last hour.
        And it should match up with these numbers:
         0-23 
         24-47 
         48-71 
        so on...... till 167.
        The day will start at 0.
        */
        //console.log(firstHour, lastHour);

    

}

//helper function: to get hours and return the number of hours.
function getHours() {
    /*now will create them as strings so that we can match the format 
        that we have in our weatherData API data for hourly forecast date
        which is this: 2026-05-27T00:00 
        right now we have this: 2026 - 04 - 27 which we created using 'for loop for days'
        and we have to turn it into this: 2026-05-27T00:00 
        so will create another for loop inside our 'day loop'
        and will be tracking the hours now which is this: T00:00*/
    for (let h = 0; h <= 23; h++) {
        //loop through the hours
             
        console.log(h);//return hour number for each day
        //we got the date format 2026-05-27T00:00 and now will work on time format T00:00
        //So T will be time, then hours and minutes
    }
}



//will use this function() for the image alt text
/*update weatherData icons:*/
function getWeatherCodeName(code) {
    /*check weatherData variable documentation for 
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

function populateDayOfWeek() {
    /*loop through 7 Days 
        day = 0, dayOfWeek = current date but get weekday name (Monday, Tuesday...)
        day = 1, use setDate() to add 1, so setDate(today + 1) and get weekday name */

        let currDate = new Date(); //this will declare the current time.


        let currDay;
    
    /*for loop:
        i equals 0, until i equals 7, i increment. 
        And it will go 7 times starting from 0.
        so 0 to 6 : Monday to Sunday. */
    for (i = 0; i < 7; i++) {
        /* Format to get the weekday:
            since we only need 1 dayOption argument for daily forecast days,
            so will just add {weekday: "long"} instead of whole dayOption variable in currDay.
            dateOptions arguments is used to customise date formats, 
            so {weekday: "long"} will give us days like Monday, Tuesady...
            and will use International date time format for internationalisation*/
        currDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(currDate);


        
        /*here will add option tag (drop-down) to the select tag in HTML
            will add elements statically
            create a new div element with tag option */
        const newOption = document.createElement("option");
        // we want to create a text node (for the days like Monday, Tuesday..) and below this will append the child aswell
        const dayOfWeek = document.createTextNode(currDay); // and give the newly created div element some content

        //create 3 new option tags
        //set attribute - class name
        newOption.setAttribute("class", "hourly__select-day");
        //set attribute - value starts at 0 string
        newOption.setAttribute("value", i);
        //and append the child
        newOption.appendChild(dayOfWeek); // add the text node to the newly created div

        //add the 3 new option tags to select tag
        // add the newly created element and its content into the DOM (ddl is parent element)
        ddlDay.insertAdjacentElement("beforeend", newOption);

        /*increment the date
            setDate() is the method of Date instances, which sets the day of the month according to local time 
            getDate() gets the number of the date
            Now the dropdown for hourly forecast will show 7 days starting from current day*/
        currDate.setDate(currDate.getDate() + 1);
    }
    console.log(ddlDay); //load contents of ddlDay (select and option tags for dropdown days (hourly forecast))
}
populateDayOfWeek(); //dropdown days for hourly forecast
getGeoData();

/*when we select another day from drop-down list,
    will run the loadHourlyForecast() function */
ddlDay.addEventListener("change", loadHourlyForecast);
/**
 * so: will run loadHourlyForecast() once when we load all the data (which will be the current weather)
        and will run it again if the drop down list changes. using our:
        ddlDay.addEventListener("change", loadHourlyForecast);
        like (when other days are selected)
 */

//console.log(getWeatherFilePath(1)); //call getWeatherFileName(code) 


// get a whole date and pull a day out of that