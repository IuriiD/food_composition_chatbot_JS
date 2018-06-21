"use strict"

const keys = require("./keys");
const fetch = require("node-fetch");

const nutrietnsURL = "https://trackapi.nutritionix.com/v2/natural/nutrients";

const averageDailyCalories = 2200;
const proteinsDaily = 50; // grams, http://www.mydailyintake.net/daily-intake-levels/
const fatsDaily = 70; // grams, http://www.mydailyintake.net/daily-intake-levels/
const carbsDaily = 310; // grams, http://www.mydailyintake.net/daily-intake-levels/
const sugarsDaily = 90; // grams, http://www.mydailyintake.net/daily-intake-levels/
const protCalPerG = 4; // calories per 1g, http://healthyeating.sfgate.com/gram-protein-carbohydrates-contains-many-kilocalories-5978.html
const fatCalPerG = 9; // calories per 1g, http://healthyeating.sfgate.com/gram-protein-carbohydrates-contains-many-kilocalories-5978.html
const carbCalPerG = 4; // calories per 1g, http://healthyeating.sfgate.com/gram-protein-carbohydrates-contains-many-kilocalories-5978.html

async function getNutrients(food) {
    // Makes a request to Nutritionix API and returns nutrient data for a given food
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
            // such food was not found
            throw new Error("I couldn't match any of your foods");
            /*return {
                "status": "not mached",
                "data": "I couldn't match any of your foods"
            };*/
        }
    } catch(error) {
        console.log(`\nERROR from function getNutrients():\n${error}`);
        throw new Error("I couldn't match any of your foods");
        /*return {
            "status": "error",
            "data": error
        }*/
    }
}

// === Calories ======================================================================================================//
function getCalories(allNutrients) {
    // Parses the allNutrients data (got using getNutrients()) and returns
    // the following fields: kkcal, kj, serving type, serving weight, serving quantity
    try {
        if (allNutrients.status == "ok") {
            let food, enercKCal, enercKj, servingQty, servingUnit, servingWeightGrams;

            food = allNutrients.data.foods[0].food_name;
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
            if (!enercKj && enercKCal) {
                enercKj = enercKCal * 4.184;
            }
            if (!enercKCal && enercKj) {
                enercKCal = enercKj / 4.184;
            }

            return {
                "status": "ok",
                "data": {
                    "food": food,
                    "enercKCal": enercKCal,
                    "enercKj": enercKj,
                    "servingQty": servingQty,
                    "servingUnit": servingUnit,
                    "servingWeightGrams": servingWeightGrams
                }
            }
        } else {
            // network/db access error, product not found, product found but no info on calories etc
            throw new Error("Sorry but I failed to find info about calorific value for the food you requested");
            /*return {
                "status": "not found",
                "data": `Sorry but I failed to find info about calorific value of ${food}`
            };*/
        }
    } catch(error) {
        console.log(`\nERROR from function getCalories():\n${error}`);
        throw new Error("Sorry but I failed to find info about calorific value for the food you requested");
        /*return {
            "status": "error",
            "data": error
        }*/
    }
}


function caloriesNumbersToText(caloriesData) {
    // Using numbers for caloric content (got using getNutrients() >> getCalories()) composes a text summary
    try {
        if (caloriesData.status == "ok") {
            let food, enercKCal100g, enercKj100g, kgToCoverDaylyEnergy, summary;
            food = caloriesData.data.food;
            enercKCal100g = Math.floor((caloriesData.data.enercKCal * 100 / caloriesData.data.servingWeightGrams) * 100) / 100;
            enercKj100g = Math.floor((caloriesData.data.enercKj * 100 / caloriesData.data.servingWeightGrams) * 100) / 100;
            kgToCoverDaylyEnergy = Math.round((averageDailyCalories / enercKCal100g * 0.1) * 100) / 100;

            summary = `${food.charAt(0).toUpperCase() + food.slice(1)} contains approximately ${enercKCal100g} kcal (${enercKj100g} kj) per 100 grams or ${caloriesData.data.enercKCal} kcal (${caloriesData.data.enercKj} kj) per a standard serving (${caloriesData.data.servingQty} ${caloriesData.data.servingUnit}, ${caloriesData.data.servingWeightGrams} g).`;
            summary += `\nSo an average person would have to consume ${kgToCoverDaylyEnergy} kg of ${food} to cover his/her daily energy requirements (~2200 kilocalories)`;

            return {
                "status": "ok",
                "data": summary
            };
        } else {
            throw new Error("Sorry but I failed to find info about calorific value for the food you requested");
        }
    } catch(error) {
        console.log(`\nERROR from function caloriesNumbersToText():\n${error}`);
        throw new Error("Sorry but I failed to find info about calorific value for the food you requested");
    }

}


async function caloriesSummary(food) {
    // Connects all functions to get a summary of caloric content for a given food
    try {
        let allNutrients = await getNutrients(food);
        let caloriesData = await getCalories(allNutrients);
        let calSummary = await caloriesNumbersToText(caloriesData);
        if (calSummary.status == "ok") {
            return calSummary.data;
        }
    } catch(error) {
        console.log(`\nERROR from function caloriesSummary():\n${error}`);
        throw new Error("Sorry but I failed to find info about calorific value for the food you requested");
    }
}

// === Proteins/Fats/Carbohydrates % =================================================================================//
function getProtFatCarbs(allNutrients) {
    // Parses the allNutrients data (got using getNutrients()) and returns
    // the following fields: procnt, fat, chocdf, serving type, serving weight, serving quantity
    // also calculates relative (%) contents of proteins, fats and carbohydrates
    try {
        if (allNutrients.status == "ok") {
            let food, procnt, fat, chocdf, procntRel, fatRel, chocdfRel, servingQty, servingUnit, servingWeightGrams;

            food = allNutrients.data.foods[0].food_name;
            servingQty = allNutrients.data.foods[0].serving_qty;
            servingUnit = allNutrients.data.foods[0].serving_unit;
            servingWeightGrams = allNutrients.data.foods[0].serving_weight_grams;

            let fullNutrients = allNutrients.data.foods[0].full_nutrients;

            // attr_id  205	CHOCDF	Carbohydrate, by difference	g
            // attr_id  204	FAT	Total lipid (fat)	g
            // attr_id  203	PROCNT	Protein	g
            for (let nutrient of fullNutrients) {
                if (nutrient.attr_id == 203) {
                    procnt = nutrient.value;
                } else if (nutrient.attr_id == 204) {
                    fat = nutrient.value;
                } else if (nutrient.attr_id == 205) {
                    chocdf = nutrient.value;
                }
            }

            // Let's calculate ratio of nutrients in terms of source of energy (1g prot or 1g of carbs = 4cal,
            // 1g of fat = 9cal)
            if (!procnt) { procnt = 0 }
            if (!fat) { fat = 0 }
            if (!chocdf) { chocdf = 0 }
            let nutrSum = procnt * protCalPerG + fat * fatCalPerG + chocdf * carbCalPerG;
            procntRel = Math.floor((procnt * protCalPerG * 100) / nutrSum * 100) / 100;
            fatRel = Math.floor((fat * fatCalPerG * 100) / nutrSum * 100) / 100;
            chocdfRel = Math.floor((chocdf * carbCalPerG * 100) / nutrSum * 100) / 100;

            return {
                "status": "ok",
                "data": {
                    "food": food,
                    "procnt": procnt,
                    "fat": fat,
                    "chocdf": chocdf,
                    "procntRel": procntRel,
                    "fatRel": fatRel,
                    "chocdfRel": chocdfRel,
                    "servingQty": servingQty,
                    "servingUnit": servingUnit,
                    "servingWeightGrams": servingWeightGrams
                }
            }
        } else {
            // network/db access error, product not found, product found but no info on calories etc
            throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates contents in the food you requested");
            /*return {
                "status": "not found",
                "data": `Sorry but I failed to find info about calorific value of ${food}`
            };*/
        }
    } catch(error) {
        console.log(`\nERROR from function getProtFatCarbs():\n${error}`);
        throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates contents in the food you requested");
        /*return {
            "status": "error",
            "data": error
        }*/
    }
}


function kgToCoverDailyNeeds(dailyNeed, in100Grams) {
    // Calculate daily needs (kg) of a product with given contents of some substance in 100g
    let eatDailyKg, eatDailySummary;
    if (in100Grams == 0) {
        eatDailySummary = "infinite quantity of";
    } else {
        eatDailyKg = Math.round((dailyNeed / in100Grams * 0.1) * 100) / 100;
        if (eatDailyKg>5) {
            eatDailySummary = `${eatDailyKg} ;)`;
        } else {
            eatDailySummary = eatDailyKg;
        }
    }
    return eatDailySummary;
}

function protFatCarbsNumbersToText(nutrData) {
    // Using numbers for main nutrients content (got using getNutrients() >> getProtFatCarbs()) composes a text summary
    try {
        if (nutrData.status == "ok") {
            let food, protIn100g, fatsIn100g, carbsIn100g, kgToCoverDaylyProt, kgToCoverDaylyFats, kgToCoverDaylyCarbs, summary;

            food = nutrData.data.food;
            protIn100g = Math.floor((nutrData.data.procnt * 100 / nutrData.data.servingWeightGrams) * 100) / 100;
            fatsIn100g = Math.floor((nutrData.data.fat * 100 / nutrData.data.servingWeightGrams) * 100) / 100;
            carbsIn100g = Math.floor((nutrData.data.chocdf * 100 / nutrData.data.servingWeightGrams) * 100) / 100;

            kgToCoverDaylyProt = kgToCoverDailyNeeds(proteinsDaily, protIn100g);
            kgToCoverDaylyFats = kgToCoverDailyNeeds(fatsDaily, fatsIn100g);
            kgToCoverDaylyCarbs = kgToCoverDailyNeeds(carbsDaily, carbsIn100g);

            /*kgToCoverDaylyProt = Math.round((proteinsDaily / protIn100g * 0.1) * 100) / 100;
            kgToCoverDaylyFats = Math.round((fatsDaily / fatsIn100g * 0.1) * 100) / 100;
            kgToCoverDaylyCarbs = Math.round((carbsDaily / carbsIn100g * 0.1) * 100) / 100;*/

            summary = `${food.charAt(0).toUpperCase() + food.slice(1)} contains approximately (per 100 g):\n
            - proteins: ${protIn100g} g (will provide ${nutrData.data.procntRel}% of calories);\n
            - fats: ${fatsIn100g} g (${nutrData.data.fatRel}%);\n
            - carbohydrates: ${carbsIn100g} g (${nutrData.data.chocdfRel}%);\n`;
            summary += `If to assume that an average person needs ${proteinsDaily}/${fatsDaily}/${carbsDaily} grams of proteins, fats and carbohydrates respectively (https://goo.gl/sGkDS),
            then in order to cover daily requirements in \n
            - proteins: one would need to consume ${kgToCoverDaylyProt} kg of ${food},
            - fats: ${kgToCoverDaylyFats} kg of ${food} and
            - carbohydrates: ${kgToCoverDaylyCarbs} kg of ${food}, respectively.`;

            return {
                "status": "ok",
                "data": summary
            };
        } else {
            throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates contents in the food you requested");
        }
    } catch(error) {
        console.log(`\nERROR from function protFatCarbsNumbersToText():\n${error}`);
        throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates contents in the food you requested");
    }

}


async function protFatsCarbsSummary(food) {
    // Connects all functions to get a summary for proteins/fats/carbohydrates contents in given food
    try {
        let allNutrients = await getNutrients(food);
        let nutrData = await getProtFatCarbs(allNutrients);
        let nutrSummary = await protFatCarbsNumbersToText(nutrData);
        if (nutrSummary.status == "ok") {
            return nutrSummary.data;
        }
    } catch(error) {
        console.log(`\nERROR from function protFatsCarbsSummary():\n${error}`);
        throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates contents in the food you requested");
    }
}
let food = "milk";
/*
caloriesSummary(food)
    .then(
        result => {console.log(result)},
        error => {console.log("Sorry but I failed to find info about calorific value for the food you requested")}
        );
*/
protFatsCarbsSummary(food)
    .then(
        result => {console.log(result)},
        error => {console.log("Sorry but I failed to find info about proteins/fats/carbohydrates contents in the food you requested")}
    );
