let event = {
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



if (event.message.is_echo) {
    console.log('True');
}


