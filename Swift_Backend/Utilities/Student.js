class Student {
    constructor(googleID) {
        this.googleID = googleID
        this.messages = [] 
        this.topics = []// [(topicName, time), ]
    }

       appendMessage(params) {
        this.messages.push(params);
       }

    addTopic(topic, time) {
        this.topics.push({topic, time});
    }

    serialize() {
        return JSON.stringify({
            googleID: this.googleID,
            messages: this.messages,
            topics: this.topics,
        });
    }

    function deserialize() {

    }
    


}
