// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();

// Performs label detection on the image file
client
    .labelDetection('https://cdn1.medicalnewstoday.com/content/images/articles/267290-apples.jpg')
    .then(results => {
        const labels = results[0].labelAnnotations;

        console.log('Labels:');
        labels.forEach(label => console.log(label.description));
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
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


/*
caloriesSummary(food)
    .then(result => {
        console.log(result.data);
    })
    .catch(error => {
        console.log(error);
    });
*/

/*
getCalories(food)
    .then(result => {
        if (result.status == "ok") {
            let enercKCal100g, enercKj100g, kgToCoverDaylyEnergy;
            enercKCal100g = Math.floor((result.data.enercKCal * 100 / result.data.servingWeightGrams) * 100) / 100;
            enercKj100g = Math.floor((result.data.enercKj * 100 / result.data.servingWeightGrams) * 100) / 100;
            kgToCoverDaylyEnergy = Math.round((averageDailyCalories / enercKCal100g * 0.1) * 100) / 100;

            console.log(`${food.charAt(0).toUpperCase() + food.slice(1)} contains ${enercKCal100g} kcal (${enercKj100g} kj) per 100 grams or ${result.data.enercKCal} kcal (${result.data.enercKj} kj) per a standard serving (${result.data.servingQty} ${result.data.servingUnit}, ${result.data.servingWeightGrams} g)`);
            console.log(`So an average person would have to consume ${kgToCoverDaylyEnergy} kg of ${food} to cover his/her daily energy requirements (~2200 kilocalories)`)
            // calculate per 100g
            // calculate how much an average person (2200 kcal/day) needs to consume if to eat this food only
        } else {
            console.log(result.data);
        }
        }
    );
*/