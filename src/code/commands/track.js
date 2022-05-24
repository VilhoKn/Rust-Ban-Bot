const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder().setName("track").setDescription("template"),
	run: async ({ client, interaction }) => {
		
	},
}