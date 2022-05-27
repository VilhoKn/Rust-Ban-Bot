const mongoose = require("mongoose")

const GuildInfoSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    tracking: Array,
    status: Boolean,
	webhookUrl: String,
})

module.exports = mongoose.model("GuildInfo", GuildInfoSchema)