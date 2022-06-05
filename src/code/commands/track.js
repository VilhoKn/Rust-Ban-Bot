const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("track").setDescription("Set people to track for bans")
			.addSubcommand(sc => sc
				.setName("add")
				.setDescription("Add people to the tracking list")
				.addStringOption(option => option
					.setRequired(true)
					.setName("name")
					.setDescription("The name to track")))
			.addSubcommand(sc => sc
				.setName("remove")
				.setDescription("Remove people or all the people from the tracking list")
				.addStringOption(option => option
					.setName("name")
					.setDescription("The name to remove")
					.setRequired(true))),
	run: async ({ client, interaction }) => {

		// Create the embed
		const embed = new MessageEmbed()

		// Get the selected name
		const choice = interaction.options.getString("name");

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
			}

			// Initialize a variable to indicate if on remove the name was found
			let notFound = false;

			// Change the tracking array depending on the subcommands
			if (interaction.options.getSubcommand() === "add") {
				info.tracking.push(choice.toLowerCase())
			}
			else if (interaction.options.getSubcommand() === "remove" && choice.toLowerCase() !== "all") {
				const index = info.tracking.indexOf(choice)
				if (index !== -1) {
					info.tracking.splice(index, 1)
				}
				else {
					// If the name was not found in the array, indicate that with notFound
					notFound = true;
				}
			}
			else if (interaction.options.getSubcommand() === "remove" && choice.toLowerCase() === "all") {
				info.tracking = []
			}

			// Save to the database
			info.save(err => {
				if (err) {
					console.log(err)
					return
				}
			})

			// Prepare the values to show in the embed
			const channel = client.channels.cache.get(info.channelId)
			const channelName = channel ? channel.name : info.guildId
			const tracking = info.tracking.join(", ")

			// Prepare the descriptions
			// Change the descriptions depending if the name was found
			const title = notFound ? "Server tracking unchanged" : "Server tracking changed"
			const desc = notFound ? "Name was not found in the tracking list" : "Removed the name from tracking"
			let statusDesc = info.status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
			let channelsDesc = info.channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
			let trackingDesc = info.tracking.length !== 0 ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

			// Combine the descriptions
			const infoDesc = statusDesc + channelsDesc + trackingDesc

			// Configuring the embed
			interaction.reply({
				embeds: [embed
				.setTitle(title)
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