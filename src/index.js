import './css/styles.css';
import debounce from 'lodash.debounce';
import toastr from "toastr";
import fetchCountries from "./fetchCountries"


const DEBOUNCE_DELAY = 900;   //через поганий інтернет зменшуємо кількість запитів
const MAX_COUNTRIES = 10;

const inputElement  = document.querySelector("input#search-box");
const singleEntry   = document.querySelector("div.country-info");
const multiplyEntry = document.querySelector("ul.country-list");

const debouncedInputHandler = debounce(inputHandler, DEBOUNCE_DELAY);
inputElement.addEventListener("input", debouncedInputHandler);

function inputHandler(event) {
    
    let userInput = event.target.value.trim().toLowerCase();
    if (!userInput.length) return false;

    fetchCountries(userInput)
    .then((results)=>{

        
        if (!results) { console.log("Error fetching data in .then() statement");  return };  

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
    .catch((error)=>{

        const err = parseInt(error.message);

        if ( err === 404 ) {

            singleEntry.innerHTML = "";
            multiplyEntry.innerHTML = "";

            toastr.error("Sorry, We cant find this country on the Earth planet.");
        }
        if ( err  > 499 ) {
            toastr.error("Error at host server - please, try again leter!")
        }
    });
    
}

function fetchResultsHandler(userInput, results) {

    results = results.filter((country)=> country.name.toLowerCase().includes(userInput));

    if (results.length > MAX_COUNTRIES) {
        toastr.warning("Too many matches found. Please enter a more specific name.");
        return {actionType: "excessive", resultString: ""};
    }

    if (results.length == 0) {
        singleEntry.innerHTML = "";
        multiplyEntry.innerHTML = "";

        toastr.error("Sorry, We cant find this country on the Earth planet.");
    }

    if (results.length === 1) {
        
        let langList = results[0].languages.reduce(
            (langString,language) =>
                { langString = langString + language.name +", "; return langString }
            ,""); langList = langList.slice(0, -2);

        return { actionType: "card", 
        resultString: /*html*/`<img src="${results[0].flags.svg}" alt="flag" width="48" height="24"/>
        <span class="country__name">${results[0].name}</span><span class="country__data"><i>native name: ${results[0].nativeName}</i></span>
        <p class="country__data">Capital:  <span class="country__text">${results[0].capital}</span></p>
        <p class="country__data">Population:  <span class="country__text">${results[0].population}</span></p>
        <p class="country__data">Languages:  <span class="country__text">${langList}</span></p>`
        }
    }

    if (results.length >1) {
        let resultString =
        results.reduce((resultString, res) => {
            resultString += /*html*/
                `<li class="country-list__item"><img src="${res.flags.svg}" alt="flag" width="32" height="16"/>
                 <span style="country-list__name">  ${res.name}</span></li>`
            return resultString;
        }, "");

        return {actionType : "list",
                resultString }
    }
}

