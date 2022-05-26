const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("channel").setDescription("Set the ban channel")
			.addSubcommand(sc => sc
				.setName("change")
				.setDescription("Set the ban channel")
				.addChannelOption(option =>
					option.setName('channel')
					.setDescription('The channel to send the bans')
					.setRequired(true)))
			.addSubcommand(sc => sc
				.setName("remove")
				.setDescription("Remove the channel")),
	run: async ({ client, interaction }) => {

		// Create the embed
		const embed = new MessageEmbed()

		// Get the selected channel
		const choice = interaction.options.getChannel("channel");

		// Get if the user wants to unset the channel
		const remove = interaction.options.getSubcommand() === "remove"

		// Try finding the guild id in the database
		GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
			// Output the possible error
			if (err) {
				console.error(err)
				return
			}
	
			// If the guild isn't in the database, make a new instance
			if (!info) {
				info = new GuildInfo({
					guildId: interaction.guildId,
					channelId: "",
					tracking: new Array,
					status: false,
				})
			}
			
			// Set the channel id to the new channel id
			// If remove subcommand was used, set it to ""
			info.channelId = remove === false ? choice.id : "";

			// Save to the database
			info.save(err => {
				if (err) {
					console.error(err)
					return
				}
			})

			// Prepare the variables to show in the embed
			const channel = client.channels.cache.get(info.channelId)
			const channelName = channel ? channel.name : info.channelId
			const tracking = info.tracking.join(", ")

			// Prepare the descriptions
			const desc = remove === false ? `Ban channel set to ${channel}` : "Removed channel"
			let statusDesc = info.status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
			let channelsDesc = info.channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
			let trackingDesc = info.tracking.length !== 0 ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

			// Combine the descriptions
			const infoDesc = statusDesc + channelsDesc + trackingDesc

			// Configuring the embed
			interaction.reply({
				embeds: [embed
				.setTitle("Server channel changed")
				.setDescription(desc)
				.setColor("#ce412b")
				.addFields(
					{name: 'Server Info', value: infoDesc },
				)
			], ephemeral: true,
			})
		})
	},
}