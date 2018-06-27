let event = {
                "sender": {
                    "id": "2145482708800024"
                },
                "recipient": {
                    "id": "230099550919706"
                },
                "timestamp": 1530086700723,
                "message": {
                    "quick_reply": {
                        "payload": "white"
                    },
                    "mid": "mid.$cAACLs82lhbZqcYt-s1kQEYyfD1z-",
                    "seq": 18745,
                    "text": "Correct"
                }
            };


let userInput = {};

if (event.message && event.message.quick_reply) {
    console.log('Here');
    console.log(event.message);
    userInput = {
        "type": "quickReplyButtonClick",
        "payload": event.message.quick_reply.payload
    }
}

console.log(userInput);

