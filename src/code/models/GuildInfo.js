const mongoose = require("mongoose")

const GuildInfoSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    tracking: Array,
    status: Boolean,
	webhook: {
        id: String,
        token: String,
        url: String,
    },
})

module.exports = mongoose.model("GuildInfo", GuildInfoSchema)