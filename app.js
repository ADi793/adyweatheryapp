// selecting elements
const countryInput = document.querySelector("#country-name");
const countryNamesSuggestions = document.querySelector("#countrynames");
const placeInput = document.querySelector("#place-name");
const placeNamesSuggestions = document.querySelector("#placenames");
const getWeatherButton = document.querySelector(".get-weather-btn");


window.addEventListener('load', (e) => {
  const countryNames = getFromLocal('countryNames');
  const placeNames = getFromLocal('placeNames');

  countryNames.forEach(countryName => {
    const countryNameSuggestion = createSuggestion(countryName);
    countryNamesSuggestions.append(countryNameSuggestion);
  });

  placeNames.forEach(placeName => {
    const placeNameSuggestion = createSuggestion(placeName);
    placeNamesSuggestions.append(placeNameSuggestion);
  })
})

getWeatherButton.addEventListener("click", async (e) => {
  // prevnting default form submission
  e.preventDefault();

  // getting input values
  const countryName = countryInput.value;
  const placeName = placeInput.value;

  // checking values
  if (countryName.length < 3 || placeName < 3)
    return Swal.fire(
      "Country?.",
      "Placename? should be 3 characters long.",
      "question"
    );

  // creating loader
  const lodader = document.createElement("div");
  lodader.classList.add("loader");
  getWeatherButton.innerHTML = "";
  getWeatherButton.append(lodader);

  // getting lat and long of country and place
  const { data: countryLatAndLongResult } = await getLongAndLat(countryName);
  const countryLatAndLong = countryLatAndLongResult.results[0].geometry;

  const { data: placeLatAndLongResult } = await getLongAndLat(
    `${placeName},${countryName}`
  );
  const placeLatAndLong = placeLatAndLongResult.results[0].geometry;

  // getting weather of country and place
  const { data: countryWeatherResult } = await getWeather(
    countryLatAndLong.lat,
    countryLatAndLong.lng
  );
  const countryWeather = countryWeatherResult.main;

  const { data: placeWeatherResult } = await getWeather(
    placeLatAndLong.lat,
    placeLatAndLong.lng
  );
  const placeWeather = placeWeatherResult.main;

  const isCountryNameExist = isExistInLocal("countryNames", countryName);
  if (!isCountryNameExist) {
    const countrySuggestion = createSuggestion(countryName);
    countryNamesSuggestions.append(countrySuggestion);
  }
  saveToLocal("countryNames", countryName);
  countryInput.value = "";

  const isPlaceNameExist = isExistInLocal("placeNames", placeName);
  if (!isPlaceNameExist) {
    const placeSuggestion = createSuggestion(placeName);
    placeNamesSuggestions.append(placeSuggestion);
  }
  saveToLocal("placeNames", placeName);
  placeInput.value = "";

  getWeatherButton.innerHTML = "Get Weater";


  Swal.fire(`${countryName.toUpperCase()} 
     - min temperature is: ${Math.round(countryWeather.temp_min - 273)} C
     - max temperature is: ${Math.round(countryWeather.temp_max - 273)} C
     
     ${placeName.toUpperCase()}
     - temperature is: ${Math.round(placeWeather.temp - 273)} C`)

});

// task functions

function getLongAndLat(region) {
  return axios.get(
    `https://api.opencagedata.com/geocode/v1/json?key=620734fb88804100aff3f87c83bf1933&q=${region}&pretty=1`
  );
}

function getWeather(lat, lon) {
  return axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3d21c8219da8a9b31138c04badb03051`
  );
}

function saveToLocal(collection, collectionItem = "") {
  let datas = [];
  if (localStorage.getItem(collection))
    datas = JSON.parse(localStorage.getItem(collection));

  const isInclude = datas.includes(collectionItem.toLocaleLowerCase());
  if (isInclude) return;

  datas.push(collectionItem.toLocaleLowerCase());
  localStorage.setItem(collection, JSON.stringify(datas));
}

function getFromLocal(collection) {
  let datas = [];
  if (localStorage.getItem(collection))
    datas = JSON.parse(localStorage.getItem(collection));

  return datas;
}

function isExistInLocal(collection, collectionItem = "") {
  let datas = [];
  if (localStorage.getItem(collection))
    datas = JSON.parse(localStorage.getItem(collection));

  return datas.includes(collectionItem.toLocaleLowerCase());
}

function createSuggestion(suggestionValue) {
  const suggestion = document.createElement("option");
  suggestion.value = suggestionValue;

  return suggestion;
}
