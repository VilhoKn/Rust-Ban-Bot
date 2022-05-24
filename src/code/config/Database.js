const mongoose = require("mongoose")
const { URL } = require("../info.js")

class Database {
    constructor () {
        this.connection = null;
    }

    connect () {
        mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            this.connection = mongoose.connection;
        }).catch(err => {
            console.error(err)
        })
    }
}

module.exports = Database;