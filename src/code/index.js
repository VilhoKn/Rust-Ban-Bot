const Discord = require("discord.js")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { TOKEN } = require('./info.js');
const fs = require('node:fs');

const LOAD_SLASH = process.argv[2] == "load"

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = '978298230196568114';

const client = new Discord.Client()

client.slashcommands = new Discord.Collection()

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.slashcommands.set(command.data.name, command)
	if (LOAD_SLASH) commands.push(command.data.toJSON());
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Successfully reloaded application (/) commands.")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully reloaded application (/) commands.")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
	client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const command = client.slashcommands.get(interaction.commandName)
            if (!command) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await command.run({ client, interaction })
        }
        handleCommand()
    })
    client.login(TOKEN)
}