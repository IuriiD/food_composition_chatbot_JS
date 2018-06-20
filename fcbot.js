const keys = require("./keys");
const fetch = require("node-fetch");

const nutrietnsURL = "https://trackapi.nutritionix.com/v2/natural/nutrients";

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




/*
function getNutrients1(food) {
    fetch(nutrietnsURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-app-id": keys.appID,
            "x-app-key": keys.appKey,
            "x-remote-user-id": 0
        },
        body: JSON.stringify({query: food})
    })
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                return 'I couldn\'t match any of your foods'
            }
        }, networkError => {
            return 'I\'ve got some problems accessing to database'
        })

        .then(jsonResponse => {
            console.log(jsonResponse);
            return jsonResponse;
        })

        .catch(error => {
            console.log(`Error: ${error}`);
            return "Ups.. some error occured. Could you please try again?";
        });
}
*/

async function getNutrients(food) {
    try {
        let response = await fetch(nutrietnsURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-app-id": keys.appID,
                "x-app-key": keys.appKey,
                "x-remote-user-id": 0
            },
            body: JSON.stringify({query: food})
        });

        if (response.status == 200) {
            return {
                "status": "ok",
                "data": await response.json()
            };

        } else {
            return {
                "status": "not mached",
                "data": "I couldn't match any of your foods"
            };
        }
    } catch(error) {
        return {
            "status": "error",
            "data": error
        }
    }
}



async function getCalories(food) {
    try {
        const allNutrients = await getNutrients(food);


        if (allNutrients.status == "ok") {
            let enercKCal, enercKj, servingQty, servingUnit, servingWeightGrams;

            servingQty = allNutrients.data.foods[0].serving_qty;
            servingUnit = allNutrients.data.foods[0].serving_unit;
            servingWeightGrams = allNutrients.data.foods[0].serving_weight_grams;

            let fullNutrients = allNutrients.data.foods[0].full_nutrients;

            // attr_id  208 ENERC_KCAL  Energy  kcal
            // attr_id  268 ENERC_KJ    Energy  kJ
            for (let nutrient of fullNutrients) {
                if (nutrient.attr_id == 208) {
                    enercKCal = nutrient.value;
                } else if (nutrient.attr_id == 268) {
                    enercKj = nutrient.value;
                }
            }
            return {
                "status": "ok",
                "data": {
                    "enercKCal": enercKCal,
                    "enercKj": enercKj,
                    "servingQty": servingQty,
                    "servingUnit": servingUnit,
                    "servingWeightGrams": servingWeightGrams
                }
            }
        } else {
            // network/db access error, product not found, product found but no info on calories etc
            return {
                "status": "not found",
                "data": `Sorry but I failed to find info about calorific value of ${food}`
            };
        }
    } catch(error) {
        return {
            "status": "error",
            "data": error
        }
    }
}


let food = "sdf";

getCalories(food)
    .then(result => {
        if (result.status == "ok") {
            console.log(`${food.charAt(0).toUpperCase() + food.slice(1)} contains ${result.data.enercKCal} kcal (${result.data.enercKj} kj) per serving (${result.data.servingQty} ${result.data.servingUnit}, ${result.data.servingWeightGrams} g)`);
            // calculate per 100g
            // calculate how much an average person (2000 kcal/day) needs to consume if to eat this food only
        } else {
            console.log(result.data);
        }
        }
    );