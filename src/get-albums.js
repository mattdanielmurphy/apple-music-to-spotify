const { music } = require('./list')

const albums = {}

music.forEach(([ artist, albumArtist, album ]) => {
	if (albums[album]) {
		// if album already has albumArtist recorded, then don't add artist
		// but if has an artists array, add artist if unique
		if (typeof albums[album] === 'object') {
			if (!albums[album].includes(artist)) albums[album].push(artist)
		}
	} else {
		albums[album] = albumArtist || [ artist ]
	}
})

const multipleArtists = []

Object.entries(albums).forEach(([ album, artists ]) => {
	if (typeof artists === 'object') {
		// if artists array only has one artist, change to string
		if (artists.length === 1) albums[album] = artists[0]
		else multipleArtists.push(album)
	}
})

module.exports = { albums }
