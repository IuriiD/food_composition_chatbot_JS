const keys = require("./keys");
const fetch = require("node-fetch");

let food = "butter";
let howManyTerms = 2;

/*
// Nutritionix API v1.1, GET request with filters
const url = `https://api.nutritionix.com/v1_1/search/${food}?results=0%3A${howManyTerms}&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=${keys.appID}&appKey=${keys.appKey}`;

fetch(url)
    .then(response => {
        return response.json();
    })
    .then(jsonResponse => {
        console.log(jsonResponse);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });*/

/*
// Nutritionix API v.2
const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${food}`;

fetch(url, {headers: {"x-app-id": keys.appID, "x-app-key": keys.appKey}})
    .then(response => {
        return response.json();
    })
    .then(jsonResponse => {
        console.log(jsonResponse["common"]);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });
*/


const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";
let reqBody = {
    query: "bread",
    timezone: "US/Eastern"
};

fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json", "x-app-id": keys.appID, "x-app-key": keys.appKey, "x-remote-user-id": 0},
    body: JSON.stringify(reqBody)
    })
    .then(response => {
        return response.json();
    })
    .then(jsonResponse => {
        /*console.log(jsonResponse);
        console.log();
        console.log(jsonResponse.foods);
        console.log();
        console.log(jsonResponse.foods[0]);
        console.log();*/
        console.log(jsonResponse.foods[0].full_nutrients);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });

/*
const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";
let reqBody = {
    query: "milk",
};

fetch(url, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {"Content-Type": "application/json", "x-app-id": keys.appID, "x-app-key": keys.appKey, "x-remote-user-id": 0}
})
    .then(res => {
        return res.json();
    })
    .then(json => console.log(json));
    */
