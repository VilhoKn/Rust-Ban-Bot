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

		if (choice && ["GUILD_VOICE", "GUILD_CATEGORY", "GUILD_STAGE_VOICE", "GUILD_DIRECTORY", "GUILD_FORUM"].includes(choice.type))
		return interaction.reply({content: ":x: Can't set this channel as the ban channel", ephemeral: true})

		// Get if the user wants to unset the channel
		const remove = interaction.options.getSubcommand() === "remove"

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

			// Set the channelId to the new one, this needs
			// to be done before the editing of the webook
			info.channelId = remove === false ? choice.id : ""
			
			// If there already is a webhook
			if (info.webhook.url) {
				try {
					// Fetch the webook
					client.fetchWebhook(info.webhook.id).then(w => {
						// Depending on the subcommand, delete or change
						// the info of the webhook
						if (remove) {
							w.delete().catch()
						}
						else {
							w.edit({
								channel: info.channelId
							}).catch(err => {console.log("err", err)})
						}
					}).catch(err => {
						console.log(err)
					} )
				}
				catch(err) {
					console.log(err)
				}
			}

			// Reset the stored webhook data, this needs 
			// to be done after the deletion of the webhook
			if (remove === true) {
				info.webhook = {id: "", token: "", url: ""}
			}

			// Save to the database
			info.save(err => {
				if (err) {
					console.log(err)
					return
				}
			})

			// If there isn't already a webhook
			if (!info.webhook.url && remove === false) {
				// Create the new webhook
				let webhook;
				try {
					webhook = choice.createWebhook("Rust Hack Report", {
						avatar: "https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png"
					})
				}
				catch (err) {
					return interaction.reply({content: ":x: Can't create webhook", ephemeral: true})
				}
				
				webhook.then(webhook => {
					// Find the guild info again to save
					GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
						// Configure the new webhook
						info.webhook = { id: webhook.id, token: webhook.token, url: webhook.url }

						// Save to the database
						info.save(err => {
							if (err) {
								console.log(err)
								return
							}
						})
					})
				})
			}

			// Prepare the variables to show in the embed
			const channel = client.channels.cache.get(info.channelId)
			const channelName = channel ? channel.name : info.channelId

			// Initialize and populate the tracking
			let tracking = []
			for (i=0; i<info.tracking.length; i++) {
				tracking.push(info.tracking[i].name)
			}
			tracking = tracking.join(", ")

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