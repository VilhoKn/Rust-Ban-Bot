const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("help").setDescription("Shows information about the commands"),
	run: async ({ client, interaction }) => {

		// Create the embed
		const embed = new MessageEmbed()

		// Try finding the guild id in the database
		GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
			// Output the possible error
			if (err) {
				console.log(err)
				return
			}
	
			// If the guild isn't in the database, make a new instance
			if (!info) {
				info = new GuildInfo({
					guildId: interaction.guildId,
					channelId: "",
					tracking: new Array,
					status: false,
					webhook: {
						id: "",
						token: "",
						url: "",
					},
				})

				// Save to the database
				info.save(err => {
					if (err) {
						console.log(err)
						return
					}
				})
			}

			// Prepare the values to show in the embed
			const channel = client.channels.cache.get(info.channelId)
			const channelName = channel ? channel.name : info.guildId
			const tracking = info.tracking.join(", ")

			// Prepare the descriptions
			const desc = `This bot is an unofficial bot that posts rust\n bans from the Rust Hack Report twitter account`
			const commandsDesc = '`/help`	Displays this message\n`/status`   Turn the bans ON or OFF\n`/channel change | remove`	Set the channel to send bans\n`/track add | remove (name or all)`\nGet alerted when a specific player gets banned'
			let statusDesc = info.status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
			let channelsDesc = info.channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
			let trackingDesc = info.tracking.length !== 0 ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

			// Combine the descriptions
			const infoDesc = statusDesc + channelsDesc + trackingDesc

			// Configuring the embed
			interaction.reply({
				embeds: [embed
				.setThumbnail("https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png")
				.setTitle("Rust Ban Bot")
				.setDescription(desc)
				.setColor("#ce412b")
				.addFields(
					{name: 'Commands', value: commandsDesc },
					{name: 'Server Info', value: infoDesc },
				)
			], ephemeral: true,
			})
		})
	},
}