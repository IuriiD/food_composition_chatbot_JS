"use strict"

const rp = require("request-promise");
const request = require("request");
const fetch = require("node-fetch");
const keys = require("./keys");

let food = "meat";
const myimgUrl0 = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Honeycrisp-Apple.jpg/532px-Honeycrisp-Apple.jpg";
const myimgUrl1 = "https://scontent.xx.fbcdn.net/v/t1.15752-9/36063381_459161051174328_756983205621399552_n.jpg?_nc_cat=0&_nc_ad=z-m&_nc_cid=0&oh=6d0c3e5b3dd2b291b0ec9a9e60d3ff31&oe=5BB09239";
const myimgUrl2 = "sdfsdf";
const myimgUrl3 = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Honeycrisp-Apple.jpg/532px-Honeycrisp-Apple2.jpg";

// Valid base64 encoded image (red bus)
const mybase644 = "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";



[
    {
        "locale":"default",
        "composer_input_disabled": false,
        "call_to_actions":[
            {
                "title": "Help",
                "type": "postback",
                "payload": "NEEDHELP"
            },
            {
                "type":"web_url",
                "title":"&#169;",
                "url":"https://iuriid.github.io/",
                "webview_height_ratio":"full"
            }
        ]
    }
]


/*
// Getting started
curl -X POST -H "Content-Type: application/json" -d '{
"setting_type":"call_to_actions",
    "thread_state":"new_thread",
    "call_to_actions":[
    {
        "payload":"GETTING_STARTED"
    }
]
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=EAAFvW4PDFGkBAFmHqqpHZBwzRrNwi3tK8MIbzyhJVQCixPUxZAGFkOG8CbV0vf6w24wX2GA5vl4yAy6LJIhFIMQgLjZAafGCs4KnqGBWoKQwoI71vfHQ0bzGxjpZBBbsnswL50xsZCZAdOmBu6Llfmt8W7ZCok0PHL2mqNsaAI0XakNPfkGOlly"
*/


/*
const http = require('https');
http.get(imgUrl, (resp) => {
    resp.setEncoding('base64');
    let body = "data:" + resp.headers["content-type"] + ";base64,";
    resp.on('data', (data) => { body += data});
    resp.on('end', () => {
        console.log(body);
        //return res.json({result: body, status: 'success'});
    });
}).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
});
*/

/*
// Donwload a file and save it locally
const fs = require('fs');
let download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
*/
//download(imgUrl1, 'google.png', function(){console.log('done');});

/*
const myrequest = require('request').defaults({ encoding: null });

myrequest.get(imgUrl1, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        let data = /*"data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
        googleVision(data);
    }
});*/



function imgToBase64(imgUrl) {
    // For images uploaded by user to FB Messenger - retrieves an image from given imgUrl and converts it
    // to a base64 encoded
    const requestNullEncoding = require('request').defaults({ encoding: null });
    return new Promise((resolve, reject) => {
        requestNullEncoding.get(imgUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let data = new Buffer(body).toString("base64");
                resolve(data);
            }
        });
    })

}


function googleVisionBase64(imgBase64) {
    // Passes an image as base64 encoded to Google Vision API to get labels
    const bestGuessesQty = 5; // Number of labels requested
    let imgLabels = [];

    return new Promise((resolve, reject) => {
        request({
                url: "https://vision.googleapis.com/v1/images:annotate",
                method: "POST",
                qs: {
                    key: keys.googleVisionApiKey
                },
                json: true,
                body: {
                    "requests": [
                        {
                            "image": {
                                "content": imgBase64
                            },
                            "features": [
                                {
                                    "type": "LABEL_DETECTION",
                                    "maxResults": bestGuessesQty
                                }
                            ]
                        }
                    ]}
            }, (error, response, body) => {
                if (!error && response.statusCode == 200 && !response.body.responses[0].error) {
                    body.responses[0].labelAnnotations.forEach(label => imgLabels.push(label.description));
                    //console.log(imgLabels);
                    resolve(imgLabels);
                } else {
                    console.log(`\nERROR from function googleVisionUrl():\n${error || JSON.stringify(response.body.responses[0].error)}`);
                    reject("Sorry but I failed to recognize anything on the image provided");
                }
            }
        )
    });
}


function googleVisionUrl(imgUrl) {
    // Passes an image by URL to Google Vision API to get labels
    const bestGuessesQty = 5; // Number of labels requested
    let imgLabels = [];
    console.log('here');

    return new Promise((resolve, reject) => {
        request({
                url: "https://vision.googleapis.com/v1/images:annotate",
                method: "POST",
                qs: {
                    key: keys.googleVisionApiKey
                },
                json: true,
                body: {
                    "requests": [
                        {
                            "image": {
                                "source": {
                                    "imageUri": imgUrl
                                }
                            },
                            "features": [
                                {
                                    "type": "LABEL_DETECTION",
                                    "maxResults": bestGuessesQty
                                }
                            ]
                        }
                    ]}
            }, (error, response, body) => {
                //console.log("Error: " + error);
                //console.log("Response: " + JSON.stringify(response));
                if (!error && response.statusCode == 200 && !response.body.responses[0].error) {
                    body.responses[0].labelAnnotations.forEach(label => imgLabels.push(label.description));
                    //console.log(imgLabels);
                    resolve(imgLabels);
                } else {
                    console.log(`\nERROR from function googleVisionUrl():\n${error || JSON.stringify(response.body.responses[0].error)}`);
                    reject("Sorry but I failed to recognize anything on the image provided");
                }
            }
        )
    });
}

async function getGV(myimgUrl) {
   try {
       const gv = await googleVisionUrl(myimgUrl);
       //console.log(gv);
   } catch(error) {
       console.log(error);
   }
};

getGV(myimgUrl2);


/*
async function imgToBase64ThenGVision(imgUrl) {
    const imgBase64 = await imgToBase64(imgUrl);
    const imgLabels = await googleVisionBase64(imgBase64);
    return imgLabels;
}

imgToBase64ThenGVision(myimgUrl3).then(imgLabels => {console.log(imgLabels)});
*/









// ===================================================================================================================//
// === GOOGLE VISION (getting labels for images) =====================================================================//
// ===================================================================================================================//
/*
async function googleVisionTheImage(imgUrl) {
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;
    try {
        // Imports the Google Cloud client library
        const vision = require('@google-cloud/vision');

        // Creates a client
        const client = new vision.ImageAnnotatorClient({
            projectId: (process.env.gcProjectId || keys.googleCloudServiceKey.project_id),
            credentials: {
                private_key: (process.env.gcPrivateKey || keys.googleCloudServiceKey.private_key ),
                client_email: (process.env.clientEmail || keys.googleCloudServiceKey.client_email)
            }
        });

        let imgLabels = [];

        // Performs label detection on the image file
        const results = await client.labelDetection(imgUrl); // client.labelDetection({"image": {"content": content64}});
        console.log(results);
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
const imgUrl1 = "https://scontent.xx.fbcdn.net/v/t1.15752-9/36063381_459161051174328_756983205621399552_n.jpg?_nc_cat=0&_nc_ad=z-m&_nc_cid=0&oh=6d0c3e5b3dd2b291b0ec9a9e60d3ff31&oe=5BB09239";


function googleVision(imgUrl) {
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;
    let imgLabels = [];

    request({
            url: "https://vision.googleapis.com/v1/images:annotate",
            method: "POST",
            qs: {
                key: keys.googleVisionApiKey
            },
            json: true,
            body: {
                "requests": [
                    {
                        "image":{
                            "source":{
                                "imageUri": imgUrl
                            }
                        },
                        "features": [
                            {
                                "type": "LABEL_DETECTION",
                                "maxResults": bestGuessesQty
                            }
                        ]
                    }
                ]}
        }, function (error, response, body) {
            if (response.statusCode == 200) {
                const labels = response.body.responses[0].labelAnnotations;
                labels.forEach(label => imgLabels.push(label.description));
                console.log(imgLabels);
            }
        }
    )
}
*/


//const mybase64 = "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";

/*
function googleVision(mybase64) {
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;
    let imgLabels = [];
    console.log('here');

    request({
            url: "https://vision.googleapis.com/v1/images:annotate",
            method: "POST",
            qs: {
                key: keys.googleVisionApiKey
            },
            json: true,
            body: {
                "requests": [
                    {
                        "image": {
                            // "data:image/gif;base64," is extra
                            "content": mybase64
                        },
                        "features": [
                            {
                                "type": "LABEL_DETECTION",
                                "maxResults": bestGuessesQty
                            }
                        ]
                    }
                ]}
        }, function (error, response, body) {
            //console.log(error);
            //console.log(response);
            body.responses[0].labelAnnotations.forEach(label => imgLabels.push(label.description))
            console.log(imgLabels);
        }
    )
}
*/

//googleVision(mybase64);


/*
function getBase64(imgUrl1) {
    const request64 = require('request').defaults({ encoding: null });

    request.get(imgUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //let data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
            let data = new Buffer(body).toString('base64');
            return data;
        }
    });
}


function googleVision64(data64) {
    // Donwloads image as a base64 encoded and pipes it to Google Vision API
    const bestGuessesQty = 5;
    let imgLabels = [];

    let options = {
        uri: "https://vision.googleapis.com/v1/images:annotate",
        method: "POST",
        qs: {
            key: keys.googleVisionApiKey
        },
        json: true,
        body: {
            "requests": [
                {
                    "image": {
                        "content": data64
                    },
                    "features": [
                        {
                            "type": "LABEL_DETECTION",
                            "maxResults": bestGuessesQty
                        }
                    ]
                }
            ]}
    };

    /*
    request(get image as base64).pipe(request.post(
    */
/*
    rp(options)
        .then(response => {
            if (!response.responses[0].error) {
                const labels = response.responses[0].labelAnnotations;
                labels.forEach(label => imgLabels.push(label.description));
                console.log(imgLabels);
                //return await imgLabels;
            } else {
                console.log(`\nERROR from function googleVision64():\n${response.responses[0].error.message}`);
                throw new Error("Sorry but I failed to recognize anything on the image provided");
            }

        })
        .catch(error => {
            console.log(`\nERROR from function googleVision64():\n${error}`);
            throw new Error("Sorry but I failed to recognize anything on the image provided");
        })
}


async function base64Vision(imgUrl) {
    let base64 = await getBase64(imgUrl);
    let vision = await googleVision64(base64);
}

//base64Vision(imgUrl);
//googleVision64(data64);


async function googleVision(imgUrl) {
    // Is working but I fail to return the result (only console.log)
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;
    let imgLabels = [];

    let options = {
            uri: "https://vision.googleapis.com/v1/images:annotate",
            method: "POST",
            qs: {
                key: keys.googleVisionApiKey
            },
            json: true,
            body: {
                "requests": [
                    {
                        "image": { // {"content": "64base"}
                            "source": {
                                "imageUri": imgUrl
                            }
                        },
                        "features": [
                            {
                                "type": "LABEL_DETECTION",
                                "maxResults": bestGuessesQty
                            }
                        ]
                    }
                ]}
        };

    rp(options)
        .then(response => {
            if (!response.responses[0].error) {
                const labels = response.responses[0].labelAnnotations;
                labels.forEach(label => imgLabels.push(label.description));
                console.log(imgLabels);
                //return await imgLabels;
            } else {
                console.log(`\nERROR from function googleVisionTheImage():\n${response.responses[0].error.message}`);
                throw new Error("Sorry but I failed to recognize anything on the image provided");
            }

        })
        .catch(error => {
            console.log(`\nERROR from function googleVisionTheImage():\n${error}`);
            throw new Error("Sorry but I failed to recognize anything on the image provided");
        })
}


async function googleVision4(imgUrl) {
    // We will be taking the first bestGuessesQty of labels
    const bestGuessesQty = 5;
    let imgLabels = [];

    let options = {
        uri: "https://vision.googleapis.com/v1/images:annotate",
        method: "POST",
        qs: {
            key: keys.googleVisionApiKey
        },
        json: true,
        body: {
            "requests": [
                {
                    "image": { // {"content": "64base"}
                        "source": {
                            "imageUri": imgUrl
                        }
                    },
                    "features": [
                        {
                            "type": "LABEL_DETECTION",
                            "maxResults": bestGuessesQty
                        }
                    ]
                }
            ]}
    };


    let {error, response, body} = await request(options);
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
}


async function googleVision2(imgUrl) {
    const bestGuessesQty = 5;
    let imgLabels = [];

    try {
        let response = await fetch("https://vision.googleapis.com/v1/images:annotate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "key": keys.googleVisionApiKey
            },
            body: JSON.stringify({
                "requests": [
                    {
                        "image": { // {"content": "64base"}
                            "source": {
                                "imageUri": imgUrl
                            }
                        },
                        "features": [
                            {
                                "type": "LABEL_DETECTION",
                                "maxResults": bestGuessesQty
                            }
                        ]
                    }
                ]})
        });

        if (response.status == 200) {
            return {
                "status": "ok",
                "data": await response.json()
            };

        } else {
            throw new Error("I couldn't match any of your foods");
        }
    } catch(error) {
        console.log(`\nERROR from function googleVision2():\n${error}`);
        throw new Error("I couldn't match any of your foods");
    }
}
*/



/*
googleVision(imgUrl1).then(
    result => { console.log(result) },
    error => { console.log("Sorry but I failed to recognize anything on the image provided") }
);
*/

/*
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
*/

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