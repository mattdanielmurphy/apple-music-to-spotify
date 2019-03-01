const prompts = require('prompts')
let execSync = require('child_process').execSync

async function getCodeFromUrl(url) {
	if (/accounts.spotify.com/.test(url)) return new Error('You returned the same URL.')
	return /\?code=(.*)/.exec(url)[1]
}

async function openAuthLinkInBrowser() {
	let cmd =
		"open 'https://accounts.spotify.com/authorize?client_id=fd5f1b4c923446d2b9af81459007f52f&redirect_uri=https://postb.in/3Fc1KKoD&response_type=code&scope=playlist-read-private%20playlist-read-collaborative%20playlist-modify-public%20playlist-modify-private%20user-library-read%20user-library-modify%20user-read-private'"

	execSync(cmd, { encoding: 'utf8' })
	return true
}

function getToken(code) {
	let response = execSync(
		`curl -X POST \
		-d grant_type=authorization_code \
		-d code=${code} \
		-d redirect_uri=https://postb.in/3Fc1KKoD \
		-d client_id=fd5f1b4c923446d2b9af81459007f52f \
		-d client_secret=33b326a69dde42a9bc4bbb8224a9f875 \
		https://accounts.spotify.com/api/token`,
		{ encoding: 'utf8' }
	)
	return JSON.parse(response).access_token
}

let authenticate = new Promise((resolve) => {
	openAuthLinkInBrowser()
	prompts({
		type: 'text',
		name: 'url',
		message: 'Paste in your URL'
	}).then(({ url }) => {
		resolve(url)
	})
})
	.then((url) => getCodeFromUrl(url), (rejection) => console.log(rejection))
	.then((code) => getToken(code))
	.then((token) => console.log(`Success! Here's your token:\n${token}`))

authenticate
