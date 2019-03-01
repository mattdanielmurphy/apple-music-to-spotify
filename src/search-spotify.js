let { albums } = require('./get-albums')
let { spotifyApi } = require('./api.js')

albums = Object.entries(albums)

const albumMatches = []
const matchlessAlbums = {}
let finishedIndexes = -1
let concurrentRequests = 0

let searchAlbums = new Promise((resolve) => {
	function searchAlbum(i) {
		let [ album, artist ] = albums[i]
		let query = `${album} ${artist}`

		let matchResults
		let done = false
		concurrentRequests++

		spotifyApi.searchAlbums(query).then(
			(data) => {
				finishedIndexes++
				matchResults = data.body.albums.items
				concurrentRequests--
				if (matchResults.length > 0) {
					let matches = matchResults.map((match) => ({
						id: match.id,
						album: match.name,
						artists: match.artists,
						link: match.external_urls.spotify,
						imageUrl: match.images[0].url
					}))

					let matchInfo = { album, artist, matches, selectedMatch: matches[0] }

					albumMatches.push(matchInfo)
				} else {
					// if no matches found add to matchless albums array
					matchlessAlbums[`${artist} - ${album}`] = true
				}
				if (finishedIndexes >= 99) resolve(albumMatches)
				// if (finishedIndexes === albums.length - 2) resolve(albumMatches)
			},
			(err) => console.error(err)
		)

		if (i < 100) {
			// if (i < albums.length - 2) {
			const tryToRequest = () => {
				if (concurrentRequests < 5) {
					searchAlbum(i + 1)
				} else {
					setTimeout(tryToRequest, 100)
				}
			}
			tryToRequest()
		} else done = true
	}

	searchAlbum(0)
})

module.exports = { searchAlbums, matchlessAlbums }
