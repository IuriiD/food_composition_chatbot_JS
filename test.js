let event = {
                    "sender": {
                        "id": "2145482708800024"
                    },
                    "recipient": {
                        "id": "230099550919706"
                    },
                    "timestamp": 1529995609838,
                    "message": {
                        "mid": "mid.$cAACLs82lhbZqbB2O7lkOtg_p9EDv",
                        "seq": 18399,
                        "attachments": [
                            {
                                "type": "image",
                                "payload": {
                                    "url": "https://scontent.xx.fbcdn.net/v/t1.15752-9/36199769_461339997623100_5937064388547575808_n.jpg?_nc_cat=0&_nc_ad=z-m&_nc_cid=0&oh=ce7682c6fb9f155fc4b083717c2055c8&oe=5B9F20AF",
                                    "sticker_id": 2
                                }
                            }
                        ]
                    }
};

let event1 =         {
    "sender": {
        "id": "2145482708800024"
    },
    "recipient": {
        "id": "230099550919706"
    },
    "timestamp": 1529783890199,
    "message": {
        "mid": "mid.$cAACLs82lhbZqX375F1kLjmym1Ddd",
        "seq": 18191,
        "text": "1"
    }
};

if (event.message && event.message.attachments) {
    console.log('here1');
    if (event.message.attachments[0].type === "image" && !event.message.attachments[0].payload.sticker_id) {
        console.log('here2');
        console.log("IMAGE");
    } else { console.log("NOT a good image"); }
} else { console.log("NOT image");}