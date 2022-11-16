import './css/styles.css';
import debounce from 'lodash.debounce';
import toastr from "toastr";


const DEBOUNCE_DELAY = 900;
const MAX_COUNTRIES = 10;

const inputElement = document.querySelector("input#search-box");
const singleEntry = document.querySelector("div.country-info");
const multiplyEntry = document.querySelector("ul.country-list");

const debouncedInputHandler = debounce(inputHandler, DEBOUNCE_DELAY);
inputElement.addEventListener("input", debouncedInputHandler);

function inputHandler(event) {
    
    let userInput = event.target.value.trim().toLowerCase();
    if (!userInput.length) return false;

    fetchCountries(userInput)
    .then((results)=>{

        const {actionType, resultString} = fetchResultsHandler(userInput, results);
        
        switch (actionType) {
            case "excessive": 
                singleEntry.innerHTML = "";
                multiplyEntry.innerHTML = "";
                break;
            case "card": 
                multiplyEntry.innerHTML = "";
                singleEntry.innerHTML = resultString; 
                break;
            case "list": 
                singleEntry.innerHTML = "";
                multiplyEntry.innerHTML = resultString; 
                break;
        }

    })
    .catch((error)=>console.log("Error during fetching: ", error));
    
}

function fetchResultsHandler(userInput, results) {

    results = results.filter((country)=> country.name.toLowerCase().includes(userInput));

    if (results.length > MAX_COUNTRIES) {
        toastr.warning("Too many matches found. Please enter a more specific name.");
        return {actionType: "excessive", resultString: ""};
    }

    if (results.length === 1) {
        
        let langList = results[0].languages.reduce(
            (langString,language) =>
                { langString = langString + language.name +", "; return langString }
            ,""); langList = langList.slice(0, -2);

        return { actionType: "card", 
        resultString: /*html*/`<img src="${results[0].flags.svg}" alt="flag" width="60" height="40"/>
        <span class="country-name">${results[0].name}</span>
        <p class="country-data">Capital:  <span class="country-text">${results[0].capital}</span></p>
        <p class="country-data">Population:  <span class="country-text">${results[0].population}</span></p>
        <p class="country-data">Languages:  <span class="country-text">${langList}</span></p>`
        }
    }

    if (results.length >1) {
        let resultString =
        results.reduce((resultString, res) => {
            resultString += /*html*/
                `<li class="country-list__item"><img src="${res.flags.svg}" alt="flag" width="25" height="16"/>
                 <span style="country-list__name">  ${res.name}</span></li>`
            return resultString;
        }, "");

        return {actionType : "list",
                resultString }
    }
}

function fetchCountries(userInput) {

    let URL = `https://restcountries.com/v2/name/${userInput}?fields=`;
    const filterResponse = ['name', 'capital', 'population', 'flags', 'languages'];
    
    URL += filterResponse.join(",");

    return fetch(URL).then((response) => {
        console.log("Responce status is: ", response.status);
        
        if (!response.ok) {
            return Promise.reject(error.text);
        }
        return response.json();
    });
}
