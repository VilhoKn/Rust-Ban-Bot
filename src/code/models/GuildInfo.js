const mongoose = require("mongoose")

const GuildInfoSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    tracking: Array,
    status: Boolean,
})

module.exports = mongoose.model("GuildInfo", GuildInfoSchema)