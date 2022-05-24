const { MongoClient } = require("mongodb");
const { MONGOPASSWORD, MONGOUSERNAME} = require("./info.js")
const fs = require("fs")

const uri = `mongodb+srv://${MONGOUSERNAME}:${MONGOPASSWORD}@clusterrust.irv5d0r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const addToDb = async function _addToDb(data) {
	try {

		await client.connect()

		const db = client.db("Alldata")
		let serverInfo = db.collection("Guilds")
		const query = { guildId: data.guildId }
		await serverInfo.findOne(query).then(g => {
			if (!g) {
				serverInfo.insertOne({ guildId: data.guildId, status: false, channelId: null, tracking: [] })
				serverInfo = db.collection("Guilds")
			}
		})

		if (data.method === "updateChannel") {
			const updateDoc = {
				$set: {
				  status: true,
				  channelId: data.channelId,
				},
			}
			const result = await serverInfo.updateOne(query, updateDoc);
		}
		else if (data.method === "updateStatus") {
			const updateDoc = {
				$set: {
				  status: data.status,
				},
			}
			const result = await serverInfo.updateOne(query, updateDoc);
		}
		else if (data.method === "updateTracking") {
			const updateDoc = {
				$push: {
					tracking: data.tracking,
				} ,
			}
			const result = await serverInfo.updateOne(query, updateDoc);
		}

	}
	
	finally {
		client.close();
	}
}

const removeFromDb = async function _removeFromDb(data) {
	try {

		await client.connect()

		const db = client.db("Alldata")
		let serverInfo = db.collection("Guilds")
		const query = { guildId: data.guildId }
		await serverInfo.findOne(query).then(g => {
			if (!g) {
				serverInfo.insertOne({ guildId: data.guildId, status: false, channelId: null, tracking: [] })
				serverInfo = db.collection("Guilds")
			}
		})

		if (data.method === "removeChannel") {
			const updateDoc = {
				$set: {
				  status: false,
				  channelId: null,
				},
			}
			const result = await serverInfo.updateOne(query, updateDoc);
		}

		if (data.method === "deleteTrack") {
			const updateDoc = {
				$pull: {
					tracking: data.tracking,
				} ,
			}
			const result = await serverInfo.updateOne(query, updateDoc);
		}

		if (data.method === "deleteAllTracking") {
			const updateDoc = {
				$set: {
					tracking: [],
				} ,
			}
			const result = await serverInfo.updateOne(query, updateDoc);
		}
	}
	finally {
		await client.close()
	}
}

const getFromDb = async function _getFromDb(data) {
	try {

		await client.connect()

		const db = client.db("Alldata")
		let serverInfo = db.collection("Guilds")
		const query = { guildId: data.guildId }
		let dataReturn = {}
		await serverInfo.findOne(query).then(g => {
			if (!g) {
				serverInfo.insertOne({ guildId: data.guildId, status: false, channelId: null, tracking: [] })
				serverInfo = db.collection("Guilds")
			}
		})
		await serverInfo.findOne(query).then(g => {
			fs.writeFile("../files/temporaryGetting.json", JSON.stringify(g), (err) => {
				if (err) throw err;
			})
		})
	}
	finally {
		await client.close()
	}
}

module.exports = { addToDb, removeFromDb, getFromDb }