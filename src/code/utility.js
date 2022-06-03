const needle = require('needle')
const { BEARER } = require("./info.js")
const GuildInfo = require("./models/GuildInfo")
const { MessageEmbed, WebhookClient } = require('discord.js')

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

const rules = [{ value: 'from:rusthackreport' }]

const SET_RULES = process.argv[2] == "set"

// Set stream rules
async function setRules() {
  const data = {
    add: rules,
  }

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
	const stream = needle.get(streamURL, {
    	headers: {
			Authorization: `Bearer ${BEARER}`,
		},
	})

	stream.on('data', (data) => {
    	try {
			console.log("data", data)
    		const json = JSON.parse(data)
			console.log("json before sending", json)
			sendEmbeds(json)
    	} catch (error) {}
	})
}

function sendEmbeds(json) {
	console.log("Send embeds...")
	GuildInfo.find({ channelId: { $ne: "" } }, (err, infos) => {
		console.log("infos", infos)
		for (let i = 0; i < infos.length; i++) {
			const info = infos[i]
		
			console.log("info", info)
			const text = json.data.text
			const words = text.split()
			const name = words.slice(0, -3).join(" ").toLowerCase()
			console.log(text, words, name)

			const webhookClient = new WebhookClient({ url: info.webhook.url });

			console.log("webhookClient", webhookClient)

			if (tracking.includes(name)) {
				webhookClient.send(embeds[new MessageEmbed()
					.setTitle(`${name} was banned | Removed from tracking`)
					.setDescription(text)
					.setColor("#3bed44")
					.setTimestamp()
					.setFooter({ text: 'Rust Hack Report', iconURL: 'https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png' })
				])

				const index = info.tracking.indexOf(name)
				if (index !== -1) {
					info.tracking.splice(index, 1)
				}

				info.save(err => {
					if (err) {
						console.log(err)
						return
					}
				})
			}
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