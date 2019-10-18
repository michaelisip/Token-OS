var { TokenClient } = require('@token-io/tpp')
var fs = require('fs')

var developerKey = '4qY7lqQw8NOl9gng0ZHgT4xdiDqxqoGVutuZwrUYQsI'
var env = 'sandbox'
var keyDir = './keys'
var token = new TokenClient({env: env, developerKey: developerKey, keyDir: keyDir});
var alias, member, keyPaths

async function TokenConfiguration() {    

    console.log("--- Token Config ---")

    try {
        keyPaths = fs.readdirSync('./keys')
    } catch (error) {
        console.error(error)
        keyPaths = []
    }

    if (keyPaths && keyPaths.length) {        
        var key = keyPaths[0].replace(/_/g, ":");
        member = token.getMember(token.UnsecuredFileCryptoEngine, key);
    }

    // get member's alias if exists, otherwise create
    if (member) {
        try {
            alias = await member.firstAlias()
            if (! alias) {
                console.error("Alias not found, delete keys folder and try again.")
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    } else {
        // create alias instead if member does not exist
        alias = {
            type: 'EMAIL',
            value: Math.random().toString(36).substring(2, 10) + '+noverify@example.com'
        }
        member = await token.createMember(alias, token.UnsecuredFileCryptoEngine)
        await member.setProfile({
            displayNameFirst: 'Demo Merchant'
        });

        await member.setProfilePicture('image/png', fs.readFileSync('southside.png'))
    }

    return { token, member, alias }
}

module.exports.init = TokenConfiguration
