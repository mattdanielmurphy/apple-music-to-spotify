require('dotenv').config()

let SpotifyWebApi = require('spotify-web-api-node')

var credentials = {
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	redirectUri: process.env.REDIRECT_URI
}

var spotifyApi = new SpotifyWebApi(credentials)

let token = process.env.ACCESS_TOKEN

spotifyApi.setAccessToken(token)

module.exports = { spotifyApi }
