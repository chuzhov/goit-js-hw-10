export default function fetchCountries(userInput) {

    let URL = `https://restcountries.com/v2/name/${userInput}?fields=`;
    const filterResponse = ['name', 'capital', 'population', 'flags', 'languages', "nativeName"];
    
    URL += filterResponse.join(",");

    return fetch(URL).then((response) => {
        
        if ( !response.ok || !(response.status >= 200 && response.status < 300) ) {
            throw new Error(response.status);
        }
        return response.json();
    });
}
