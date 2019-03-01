let { searchAlbums, matchlessAlbums } = require('./search-spotify')
let { spotifyApi } = require('./api.js')

const body = document.getElementsByTagName('body')[0]

const newDiv = () => document.createElement('div')

function displayAlbums(albums) {
	let matchedAlbumsDiv = document.getElementById('matched-albums')

	let matchedAlbumsHeader = document.createElement('h1')
	matchedAlbumsHeader.innerText = 'Matched Albums'

	matchedAlbumsDiv.appendChild(matchedAlbumsHeader)
	function makeButton(innerHTML) {
		let button = document.createElement('button')
		button.innerHTML = innerHTML
		button.className = 'button'
		return button
	}

	albums = albums.sort((a, b) => a.artist.localeCompare(b.artist))

	albums.forEach((result) => {
		function makeDeleteButton() {
			let deleteButton = makeButton('&times;')
			deleteButton.onclick = disableMatch
			deleteButton.artist = artist
			deleteButton.album = album
			return deleteButton
		}
		const { album, artist, matches } = result

		let newCell = () => {
			let cell = newDiv()
			cell.className = 'cell'
			return cell
		}

		let originalCell = newCell()
		originalCell.innerText = `${artist} - ${album}`
		originalCell.className = 'cell original'

		let match = matches[0]

		let matchesCell = newCell()
		matchesCell.className = 'cell matches'
		if (matches.length > 1) {
			let select = document.createElement('select')
			matches.forEach((match) => {
				let option = document.createElement('option')
				let matchArtist = match.artists[0].name
				option.value = match.id
				option.innerText = `${matchArtist} - ${match.album}`
				option.details = { id: match.id, link: match.link }
				select.appendChild(option)
			})
			matchesCell.appendChild(select)
			select.onchange = handleSelectChange
			select.album = album
			select.artist = artist
		}
		matchesCell.matches = matches

		let row = newDiv()
		row.className = 'row enabled'
		row.appendChild(originalCell)
		row.appendChild(matchesCell)
		row.appendChild(makeDeleteButton())
		if (matches.length < 2) row.className += ' singleMatch'
		if (album === artist) row.className += ' self-titled'

		matchedAlbumsDiv.appendChild(row)
	})

	let doneButton = makeButton('Done')
	doneButton.className += ' done'
	doneButton.onclick = saveAlbums

	document.getElementById('done-wrapper').appendChild(doneButton)

	function handleSelectChange(e) {
		let albumIndex = albums.findIndex(({ album, artist }) => album === e.target.album && artist === e.target.artist)
		albums[albumIndex].selectedMatch = e.target.options[e.target.selectedIndex].value
	}

	async function saveAlbum(i) {
		const matchId = albums[i].selectedMatch.id
		await spotifyApi.addToMySavedAlbums([ matchId ]).then(
			(data) => {
				numSaved++
				console.log(
					`${numSaved}/${albums.length}\tsaved | Most recent: ${albums[i].album} by ${albums[i].artist}`
				)
				successiveErrors = 0
			},
			(err) => {
				albumsNotSaved.push(matchId)
				successiveErrors++
				console.log(
					`Error: ${albumsNotSaved.length}/${albums.length} unable to be saved. Successive errors: ${successiveErrors}`
				)
			}
		)
		return true
	}

	function saveAlbums() {
		async function saveNextAlbum(i) {
			// when update select, that updates albums[i].selectedMatch
			// now just have to go through and pick selected match
			// if (match && !matchlessAlbums[`${match.artist} - ${match.album}`]) {

			saveAlbum(i).then(
				() => {
					if (i < albums.length - 1) {
						const next = () => saveNextAlbum(i + 1)
						setTimeout(next, 200)
					} else {
						console.log(`Saved ${numSaved} albums`)
						displayMatchlessAlbums()
					}
				},
				(err) => console.log(err)
			)
		}
		saveNextAlbum(0)
	}
	function displayMatchlessAlbums() {
		let matchlessAlbumsList = newDiv()
		matchlessAlbumsList.id = 'matchless-albums'
		let matchlessAlbumsHeader = document.createElement('h1')
		matchlessAlbumsHeader.innerText = 'Matchless Albums'
		matchlessAlbumsList.appendChild(matchlessAlbumsHeader)
		Object.keys(matchlessAlbums).forEach((album) => {
			row = newDiv()
			row.innerText = album
			row.className = 'row'
			matchlessAlbumsList.appendChild(row)
		})
		body.appendChild(matchlessAlbumsList)
	}

	function disableMatch(e) {
		if (/disabled/.test(e.target.parentElement.className)) {
			e.target.parentElement.classList.replace('disabled', 'enabled')
			e.target.innerHTML = '&times;'
			let albumInfo = matchlessAlbums[`${e.target.artist} - ${e.target.album}`]
			albums.push(albumInfo)
			delete matchlessAlbums[`${e.target.artist} - ${e.target.album}`]
		} else {
			e.target.parentElement.classList.replace('enabled', 'disabled')
			e.target.innerText = '+'
			let albumInfoIndex = albums.findIndex((r) => r.album === e.target.album && r.artist === e.target.artist)
			matchlessAlbums[`${e.target.artist} - ${e.target.album}`] = albums[albumInfoIndex]
			albums = albums.filter((r) => {
				if (!(r.album === e.target.album && r.artist === e.target.artist)) return r
			})
		}
	}
}

let numSaved = 0
const albumsNotSaved = []
let successiveErrors = 0

searchAlbums.then((result) => displayAlbums(result))
