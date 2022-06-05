const needle = require('needle')
const { BEARER } = require("./info.js")
const GuildInfo = require("./models/GuildInfo")
const { MessageEmbed, WebhookClient } = require('discord.js')

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

// Configure the rules
const rules = [{ value: 'from:rusthackreport' }]

// Reset the rules if you provide set as an argument: "node ./utility.js set"
const SET_RULES = process.argv[2] == "set"

// Set stream rules
async function setRules() {

	// Configure the data
	const data = {
		add: rules,
	}

	// Make the request
	const response = await needle('post', rulesURL, data, {
		headers: {
			'content-type': 'application/json',
			Authorization: `Bearer ${BEARER}`,
		},
	})

	console.log(response.body)
	return response.body
}

function streamTweets() {

	console.log("Streaming tweets...")

	// Opening the stream
	const stream = needle.get(streamURL, {
    	headers: {
			Authorization: `Bearer ${BEARER}`,
		},
	})

	// When a new tweet gets posted, send the embeds
	stream.on('data', (data) => {
    	try {
			console.log("raw data", data)

    		const json = JSON.parse(data)
			console.log("json", json)

			sendEmbeds(json)
    	} catch (error) {}
	})
}

function sendEmbeds(json) {

	console.log("Sending embeds...")

	// Find all guilds with a ban channel set
	GuildInfo.find({ channelId: { $ne: "" } }, (err, infos) => {

		console.log("infos", infos)

		// Loop over the guilds
		for (let i = 0; i < infos.length; i++) {
			const info = infos[i]
		
			console.log("info", info)

			// Separate some data from the text
			const text = json.data.text
			const words = text.split()
			const name = words.slice(0, -3).join(" ").toLowerCase()
			console.log(text, words, name)

			// Make a new instance of the webhook client
			const webhookClient = new WebhookClient({ url: info.webhook.url });

			console.log("webhookClient", webhookClient)

			// If the person is tracked, send a special message
			if (tracking.includes(name)) {
				webhookClient.send(embeds[new MessageEmbed()
					.setTitle(`${name} was banned | Tracking ended`)
					.setDescription(text)
					.setColor("#3bed44")
					.setTimestamp()
					.setFooter({ text: 'Rust Hack Report', iconURL: 'https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png' })
				])

				// Remove the person from the tracking
				const index = info.tracking.indexOf(name)
				if (index !== -1) {
					info.tracking.splice(index, 1)
				}

				// Save to the database
				info.save(err => {
					if (err) {
						console.log(err)
						return
					}
				})
			}

			// If they have status on, send them the normal embed
			else if (info.status) {
				webhookClient.send(embeds[new MessageEmbed()
					.setTitle(`${name} was banned`)
					.setDescription(text)
					.setColor("#ce412b")
					.setTimestamp()
				])
			}
		
		}
	})
}

if (SET_RULES) setRules()
else streamTweets()