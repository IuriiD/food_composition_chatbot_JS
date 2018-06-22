"use strict"


const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const keys = require("./keys");
const functions = require(".functions");
const variables = require("./variables");

const nutrietnsURL = "https://trackapi.nutritionix.com/v2/natural/nutrients";

// ===================================================================================================================//
// === VARIABLES =====================================================================================================//
// ===================================================================================================================//
const averageDailyCalories = 2200;
const proteinsDaily = 50; // grams, http://www.mydailyintake.net/daily-intake-levels/
const fatsDaily = 70; // grams, http://www.mydailyintake.net/daily-intake-levels/
const carbsDaily = 310; // grams, http://www.mydailyintake.net/daily-intake-levels/
const sugarsDaily = 90; // grams, http://www.mydailyintake.net/daily-intake-levels/
const protCalPerG = 4; // calories per 1g, http://healthyeating.sfgate.com/gram-protein-carbohydrates-contains-many-kilocalories-5978.html
const fatCalPerG = 9; // calories per 1g, http://healthyeating.sfgate.com/gram-protein-carbohydrates-contains-many-kilocalories-5978.html
const carbCalPerG = 4; // calories per 1g, http://healthyeating.sfgate.com/gram-protein-carbohydrates-contains-many-kilocalories-5978.html



let app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
    res.send("FoodCompositionBot<br>More details: <a href='https://github.com/IuriiD/food_composition_chatbot_JS'>Github</a><br><a href='http://iuriid.github.io'>Iurii Dziuban - June 2018</a>");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
    if (req.query["hub.verify_token"] === "foodcompositionbot1982") {
        console.log("FoodCompositionBot: Webhook verified");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("FoodCompositionBot: Verification failed. Tokens do not match.");
        res.sendStatus(403);
    }
});


// ===================================================================================================================//
// === NUTRITIONIX (getting nutrient data) ===========================================================================//
// ===================================================================================================================//
async function getNutrients(food) {
    // Makes a request to Nutritionix API and returns all nutrient data for a given food
    try {
        let response = await fetch(nutrietnsURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-app-id": keys.nutritionixAppID,
                "x-app-key": keys.nutritionixAppKey,
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

            kgToCoverDaylyEnergy = kgToCoverDailyNeeds(averageDailyCalories, enercKCal100g);

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
    // also calculates relative (%) content of proteins, fats and carbohydrates
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
            throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates content in the food you requested");
            /*return {
                "status": "not found",
                "data": `Sorry but I failed to find info about calorific value of ${food}`
            };*/
        }
    } catch(error) {
        console.log(`\nERROR from function getProtFatCarbs():\n${error}`);
        throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates content in the food you requested");
        /*return {
            "status": "error",
            "data": error
        }*/
    }
}


function kgToCoverDailyNeeds(dailyNeed, in100Grams) {
    // Calculate daily needs (kg) of a product with given content of some substance in 100g
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

            summary = `${food.charAt(0).toUpperCase() + food.slice(1)} contains approximately (per 100 g):
            - proteins: ${protIn100g} g (will provide ${nutrData.data.procntRel}% of calories);
            - fats: ${fatsIn100g} g (${nutrData.data.fatRel}%);
            - carbohydrates: ${carbsIn100g} g (${nutrData.data.chocdfRel}%);`;
            summary += `\nIf to assume that an average person needs ${proteinsDaily}/${fatsDaily}/${carbsDaily} grams of proteins, fats and carbohydrates respectively,
            then in order to cover daily requirements in
            - proteins: one would need to consume ${kgToCoverDaylyProt} kg of ${food},
            - fats: ${kgToCoverDaylyFats} kg of ${food} and
            - carbohydrates: ${kgToCoverDaylyCarbs} kg of ${food}, respectively.`;

            return {
                "status": "ok",
                "data": summary
            };
        } else {
            throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates content in the food you requested");
        }
    } catch(error) {
        console.log(`\nERROR from function protFatCarbsNumbersToText():\n${error}`);
        throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates content in the food you requested");
    }

}


async function protFatsCarbsSummary(food) {
    // Connects all functions to get a summary for proteins/fats/carbohydrates content in given food
    try {
        let allNutrients = await getNutrients(food);
        let nutrData = await getProtFatCarbs(allNutrients);
        let nutrSummary = await protFatCarbsNumbersToText(nutrData);
        if (nutrSummary.status == "ok") {
            return nutrSummary.data;
        }
    } catch(error) {
        console.log(`\nERROR from function protFatsCarbsSummary():\n${error}`);
        throw new Error("Sorry but I failed to find info about proteins/fats/carbohydrates content in the food you requested");
    }
}


// === Vitamins ======================================================================================================//
function getVitamins(allNutrients) {
    // Parses the allNutrients data (got using getNutrients()) and returns
    // the following fields: procnt, fat, chocdf, serving type, serving weight, serving quantity
    // also calculates relative (%) content of proteins, fats and carbohydrates
    try {
        if (allNutrients.status == "ok") {
            let food, servingQty, servingUnit, servingWeightGrams, vitK_430, vitE_573, vitE_323, vitD3_326, vitD2_325,
                vitD_328, vitD_324, vitC_401, vitB6_415, vitB12_578, vitB12_418, vitA_320, vitA_318, vitE_342, vitE_343,
                vitE_341, vitB1_404, vitB2_405, vitA1_319, vitB5_410;

            food = allNutrients.data.foods[0].food_name;
            servingQty = allNutrients.data.foods[0].serving_qty;
            servingUnit = allNutrients.data.foods[0].serving_unit;
            servingWeightGrams = allNutrients.data.foods[0].serving_weight_grams;

            let fullNutrients = allNutrients.data.foods[0].full_nutrients;

            /*
            319	RETOL	Retinol (A-1)	Âµg
            320	VITA_RAE	Vitamin A, RAE	Âµg
            318	VITA_IU	Vitamin A, IU	IU

            404	THIA	Thiamin (B-1)	mg
            405	RIBF	Riboflavin (B-2)	mg
            410	PANTAC	Pantothenic acid (B-5)	mg
            415	VITB6A	Vitamin B-6	mg
            578	NULL	Vitamin B-12, added	Âµg
            418	VITB12	Vitamin B-12	Âµg

            401	VITC	Vitamin C, total ascorbic acid	mg

            326	CHOCAL	Vitamin D3 (cholecalciferol)	Âµg
            325	ERGCAL	Vitamin D2 (ergocalciferol)	Âµg
            328	VITD	Vitamin D (D2 + D3)	Âµg
            324	VITD	Vitamin D	IU

            573	NULL	Vitamin E, added	mg
            323	TOCPHA	Vitamin E (alpha-tocopherol)	mg
            342	TOCPHG	Tocopherol, gamma (E)	mg
            343	TOCPHD	Tocopherol, delta (E)	mg
            341	TOCPHB	Tocopherol, beta (E)	mg

            430	VITK1	Vitamin K (phylloquinone)	Âµg
             */
            for (let nutrient of fullNutrients) {
                if (nutrient.attr_id == 430) {
                    vitK_430 = nutrient.value;
                } else if (nutrient.attr_id == 573) {
                    vitE_573 = nutrient.value;
                } else if (nutrient.attr_id == 323) {
                    vitE_323 = nutrient.value;
                } else if (nutrient.attr_id == 326) {
                    vitD3_326 = nutrient.value;
                } else if (nutrient.attr_id == 325) {
                    vitD2_325 = nutrient.value;
                } else if (nutrient.attr_id == 328) {
                    vitD_328 = nutrient.value;
                } else if (nutrient.attr_id == 324) {
                    vitD_324 = nutrient.value;
                } else if (nutrient.attr_id == 401) {
                    vitC_401 = nutrient.value;
                } else if (nutrient.attr_id == 415) {
                    vitB6_415 = nutrient.value;
                } else if (nutrient.attr_id == 578) {
                    vitB12_578 = nutrient.value;
                } else if (nutrient.attr_id == 418) {
                    vitB12_418 = nutrient.value;
                } else if (nutrient.attr_id == 320) {
                    vitA_320 = nutrient.value;
                } else if (nutrient.attr_id == 318) {
                    vitA_318 = nutrient.value;
                } else if (nutrient.attr_id == 342) {
                    vitE_342 = nutrient.value;
                } else if (nutrient.attr_id == 343) {
                    vitE_343 = nutrient.value;
                } else if (nutrient.attr_id == 341) {
                    vitE_341 = nutrient.value;
                } else if (nutrient.attr_id == 404) {
                    vitB1_404 = nutrient.value;
                } else if (nutrient.attr_id == 405) {
                    vitB2_405 = nutrient.value;
                } else if (nutrient.attr_id == 319) {
                    vitA1_319 = nutrient.value;
                } else if (nutrient.attr_id == 410) {
                    vitB5_410 = nutrient.value;
                }
            }

            return {
                "status": "ok",
                "data": {
                    "food": food,
                    "servingQty": servingQty,
                    "servingUnit": servingUnit,
                    "servingWeightGrams": servingWeightGrams,
                    "vitA_320": vitA_320,
                    "vitA_318": vitA_318,
                    "vitA1_319": vitA1_319,
                    "vitB1_404": vitB1_404,
                    "vitB2_405": vitB2_405,
                    "vitB5_410": vitB5_410,
                    "vitB6_415": vitB6_415,
                    "vitB12_578": vitB12_578,
                    "vitB12_418": vitB12_418,
                    "vitC_401": vitC_401,
                    "vitD3_326": vitD3_326,
                    "vitD2_325": vitD2_325,
                    "vitD_328": vitD_328,
                    "vitD_324": vitD_324,
                    "vitE_573": vitE_573,
                    "vitE_323": vitE_323,
                    "vitE_342": vitE_342,
                    "vitE_343": vitE_343,
                    "vitE_341": vitE_341,
                    "vitK_430": vitK_430
                }
            }
        } else {
            // network/db access error, product not found, product found but no info on calories etc
            throw new Error("Sorry but I failed to find info about vitamins content in the food you requested");
            /*return {
                "status": "not found",
                "data": `Sorry but I failed to find info about calorific value of ${food}`
            };*/
        }
    } catch(error) {
        console.log(`\nERROR from function getVitamins():\n${error}`);
        throw new Error("Sorry but I failed to find info about vitamins content in the food you requested");
        /*return {
            "status": "error",
            "data": error
        }*/
    }
}


function vitaminNumbersToText(vitaminData) {
    // Using numbers for main nutrients content (got using getNutrients() >> getProtFatCarbs()) composes a text summary
    // P.s. % from daily requirements can be calculated but can be added later
    try {
        if (vitaminData.status == "ok") {
            let food, summary, vitAmcg, vitAME, vitB1, vitB2, vitB5, vitB6, vitB12, vitC, vitDmcg, vitDME, vitE, vitK;
            let vitAmcgIn100g, vitAMEIn100g, vitB1In100g, vitB2In100g, vitB5In100g, vitB6In100g, vitB12In100g,
                vitCIn100g, vitDmcgIn100g, vitDMEIn100g, vitEIn100g, vitKIn100g;

            food = vitaminData.data.food;

            // Vitamin A
            if (vitaminData.data.vitA_320) {
                vitAmcg = vitaminData.data.vitA_320;
            } else {
                if (vitaminData.data.vitA1_319) {
                    vitAmcg = vitaminData.data.vitA1_319;
                } else {
                    vitAmcg = 0;
                }
            }

            if (vitaminData.data.vitA_318) {
                vitAME = vitaminData.data.vitA_318;
            } else {
                vitAME = 0;
            }

            // Some vitamins are duplicated (2 analogous values or total value and several components)
            // Let's get a single value for each vitamin (some vitamins have 2 values - in mcg/mg and IE)
            // Vitamin B1
            vitaminData.data.vitB1_404 ? vitB1 = vitaminData.data.vitB1_404 : vitB1 = 0;

            // Vitamin B2
            vitaminData.data.vitB2_405 ? vitB2 = vitaminData.data.vitB2_405 : vitB2 = 0;

            // Vitamin B5
            vitaminData.data.vitB5_410 ? vitB5 = vitaminData.data.vitB5_410 : vitB5 = 0;

            // Vitamin B6
            vitaminData.data.vitB6_415 ? vitB6 = vitaminData.data.vitB6_415 : vitB6 = 0;

            // Vitamin B12
            if (vitaminData.data.vitB12_418) {
                vitB12 = vitaminData.data.vitB12_418;
            }
            if (vitaminData.data.vitB12_578) {
                vitB12 += vitaminData.data.vitB12_578;
            }

            // Vitamin C
            vitaminData.data.vitC_401 ? vitC = vitaminData.data.vitC_401 : vitC = 0;

            // Vitamin D
            vitaminData.data.vitD_324 ? vitDME = vitaminData.data.vitD_324 : vitDME = 0;
            if (vitaminData.data.vitD_328) {
                vitDmcg = vitaminData.data.vitD_328;
            } else {
                vitDmcg = 0;
                if (vitaminData.data.vitD_325) {
                    vitDmcg = vitaminData.data.vitD_325;
                }
                if (vitaminData.data.vitD_326) {
                    vitDmcg += vitaminData.data.vitD_326;
                }
            }

            // Vitamin E
            vitE = 0;

            if (vitaminData.data.vitE_323) {
                vitE = vitaminData.data.vitE_323;
            }

            if (vitaminData.data.vitE_573) {
                vitE += vitaminData.data.vitE_573;
            }

            if (vitE == 0) {
                if (vitaminData.data.vitE_341) {
                    vitE = vitaminData.data.vitE_341;
                }
                if (vitaminData.data.vitE_342) {
                    vitE += vitaminData.data.vitE_342;
                }
                if (vitaminData.data.vitE_343) {
                    vitE += vitaminData.data.vitE_343;
                }
            }

            // Vitamin K
            vitaminData.data.vitK_430 ? vitK = vitaminData.data.vitK_430 : vitK = 0;

            if (vitAmcg != 0) {
                vitAmcgIn100g = Math.floor((vitAmcg * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitAmcgIn100g = 0;
            }

            if (vitAME != 0) {
                vitAMEIn100g = Math.floor((vitAME * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitAMEIn100g = 0;
            }

            if (vitB1 != 0) {
                vitB1In100g = Math.floor((vitB1 * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitB1In100g = 0;
            }

            if (vitB2 != 0) {
                vitB2In100g = Math.floor((vitB2 * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitB2In100g = 0;
            }

            if (vitB5 != 0) {
                vitB5In100g = Math.floor((vitB5 * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitB5In100g = 0;
            }

            if (vitB6 != 0) {
                vitB6In100g = Math.floor((vitB6 * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitB6In100g = 0;
            }

            if (vitB12 != 0) {
                vitB12In100g = Math.floor((vitB12 * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitB12In100g = 0;
            }

            if (vitC != 0) {
                vitCIn100g = Math.floor((vitC * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitCIn100g = 0;
            }

            if (vitDmcg != 0) {
                vitDmcgIn100g = Math.floor((vitDmcg * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitDmcgIn100g = 0;
            }

            if (vitDME != 0) {
                vitDMEIn100g = Math.floor((vitDME * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitDMEIn100g = 0;
            }

            if (vitE != 0) {
                vitEIn100g = Math.floor((vitE * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitEIn100g = 0;
            }

            if (vitK != 0) {
                vitKIn100g = Math.floor((vitK * 100 / vitaminData.data.servingWeightGrams) * 100) / 100;
            } else {
                vitKIn100g = 0;
            }

            summary = `${food.charAt(0).toUpperCase() + food.slice(1)} contains approximately (per 100 g):`;
            if (vitAmcgIn100g || vitAMEIn100g) {
                summary += "\nVitamin A: ";
                if (vitAmcgIn100g && !vitAMEIn100g) {
                    summary += `${vitAmcgIn100g} mcg`;
                }
                if (vitAMEIn100g && !vitAmcgIn100g) {
                    summary += `${vitAMEIn100g} IE`;
                }
                if (vitAMEIn100g && vitAmcgIn100g) {
                    summary += `${vitAmcgIn100g} mcg (${vitAMEIn100g} IE)`;
                }
            }

            if (vitB1In100g) {
                summary += `\nVitamin B1: ${vitB1In100g} mg`;
            }

            if (vitB2In100g) {
                summary += `\nVitamin B2: ${vitB2In100g} mg`;
            }

            if (vitB5In100g) {
                summary += `\nVitamin B5: ${vitB5In100g} mg`;
            }

            if (vitB6In100g) {
                summary += `\nVitamin B6: ${vitB6In100g} mg`;
            }

            if (vitB12In100g) {
                summary += `\nVitamin B12: ${vitB12In100g} mcg`;
            }

            if (vitCIn100g) {
                summary += `\nVitamin C: ${vitCIn100g} mcg`;
            }

            if (vitDmcgIn100g || vitDMEIn100g) {
                summary += "\nVitamin D: ";
                if (vitDmcgIn100g && !vitDMEIn100g) {
                    summary += `${vitDmcgIn100g} mcg`;
                }
                if (vitDMEIn100g && !vitDmcgIn100g) {
                    summary += `${vitDMEIn100g} IE`;
                }
                if (vitDMEIn100g && vitDmcgIn100g) {
                    summary += `${vitDmcgIn100g} mcg (${vitDMEIn100g} IE)`;
                }
            }

            if (vitEIn100g) {
                summary += `\nVitamin E: ${vitEIn100g} mg`;
            }

            if (vitKIn100g) {
                summary += `\nVitamin K: ${vitKIn100g} mcg`;
            }

            return {
                "status": "ok",
                "data": summary
            };
        } else {
            throw new Error("Sorry but I failed to find vitamin data for the food you requested");
        }
    } catch(error) {
        console.log(`\nERROR from function vitaminNumbersToText():\n${error}`);
        throw new Error("Sorry but I failed to find vitamin data for the food you requested");
    }

}


async function vitaminsSummary(food) {
    // Connects all functions to get a summary for vitamins content in given food
    try {
        let allNutrients = await getNutrients(food);
        let vitaminData = await getVitamins(allNutrients);
        let vitaminSummary = await vitaminNumbersToText(vitaminData);
        if (vitaminSummary.status == "ok") {
            return vitaminSummary.data;
        }
    } catch(error) {
        console.log(`\nERROR from function vitaminsSummary():\n${error}`);
        throw new Error("Sorry but I failed to find vitamin data for the food you requested");
    }
}


async function totalSummary(food) {
    // Connects all functions for all 3 queries (calories, proteins/fats/carbs, vitamins)
    // to get a total summary for a given food
    let allTogether = "";
    try {
        let allNutrients = await getNutrients(food);

        let caloriesData = await getCalories(allNutrients);
        let calSummary = await caloriesNumbersToText(caloriesData);
        if (calSummary.status == "ok") {
            allTogether += calSummary.data;
        }

        let nutrData = await getProtFatCarbs(allNutrients);
        let nutrSummary = await protFatCarbsNumbersToText(nutrData);
        if (nutrSummary.status == "ok") {
            if (allTogether != "") {
                allTogether += "\n\n";
            }
            allTogether += nutrSummary.data;
        }

        let vitaminData = await getVitamins(allNutrients);
        let vitaminSummary = await vitaminNumbersToText(vitaminData);
        if (vitaminSummary.status == "ok") {
            if (allTogether != "") {
                allTogether += "\n\n";
            }
            allTogether += vitaminSummary.data;
        }

        return allTogether;

    } catch(error) {
        console.log(`\nERROR from function vitaminsSummary():\n${error}`);
        throw new Error("Sorry but I failed to find data for the food you requested");
    }
}


// ===================================================================================================================//
// === GOOGLE VISION (getting labels for images) =====================================================================//
// ===================================================================================================================//
function googleVisionTheImage1(imgUrl) {
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;

    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient({
        projectId: keys.googleCloudServiceKey.project_id,
        credentials: {
            private_key: keys.googleCloudServiceKey.private_key,
            client_email: keys.googleCloudServiceKey.client_email
        }
    });

    let imgLabels = [];

    // Performs label detection on the image file
    client
        .labelDetection(imgUrl)
        .then(results => {
            const labels = results[0].labelAnnotations.slice(1,bestGuessesQty+1)

            labels.forEach(label => imgLabels.push(label.description));
            console.log(imgLabels);
        })
        .catch(error => {
            console.log(`\nERROR from function googleVisionTheImage():\n${error}`);
            throw new Error("Sorry but I failed to recognize anything on the image provided");
        });
}


async function googleVisionTheImage(imgUrl) {
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;
    try {
        // Imports the Google Cloud client library
        const vision = require('@google-cloud/vision');

        // Creates a client
        const client = new vision.ImageAnnotatorClient({
            projectId: keys.googleCloudServiceKey.project_id,
            credentials: {
                private_key: keys.googleCloudServiceKey.private_key,
                client_email: keys.googleCloudServiceKey.client_email
            }
        });

        let imgLabels = [];

        // Performs label detection on the image file
        const results = await client.labelDetection(imgUrl);
        const labels = results[0].labelAnnotations.slice(1, bestGuessesQty+1);
        labels.forEach(label => imgLabels.push(label.description));
        return imgLabels;
    } catch(error) {
        console.log(`\nERROR from function googleVisionTheImage():\n${error}`);
        throw new Error("Sorry but I failed to recognize anything on the image provided");
    }
}



let food = "meat";
const imgUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Honeycrisp-Apple.jpg/532px-Honeycrisp-Apple.jpg";

/*
// === Testing output ================================================================================================//
caloriesSummary(food)
    .then(
        result => {console.log(result)},
        error => {console.log("Sorry but I failed to find info about calorific value for the food you requested")}
        );

protFatsCarbsSummary(food)
    .then(
        result => {console.log(result)},
        error => {console.log("Sorry but I failed to find info about proteins/fats/carbohydrates content in the food you requested")}
    );


vitaminsSummary(food)
    .then(
        result => {console.log(result)},
        error => {console.log("Sorry but I failed to find vitamin data for the food you requested")}
    );


totalSummary(food)
    .then(
        result => {console.log(result)},
        error => {console.log("Sorry but I failed to find data for the food you requested")}
    );


googleVisionTheImage(imgUrl).then(
    result => { console.log(result) },
    error => { console.log("Sorry but I failed to recognize anything on the image provided") }
);
*/