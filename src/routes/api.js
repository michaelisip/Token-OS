var fs = require('fs');

async function Routes(app, token, member, alias) {

    console.log("---- Routes Config ----")

    app.get('/', (req, res) => {
        fs.readFile('src/public/index.html', 'utf-8', function(err, contents) {
            if(err) console.error(err)
            res.set('Content-Type', 'text/html')
            res.send(contents);
        })
    });

    // Route which button on frontend will target
    app.post('/transfer', async function (req, res) {

        console.log("------ Tranfer Starting -------")

        var destination = {
            account: {
                fasterPayments: {
                    sortCode: '123456',
                    accountNumber: '123456789'
                }
            }
        }
        var form = req.body
        var nonce = token.Util.generateNonce()
        req.session.nonce = nonce
        var redirectUrl =  req.protocol + '://' + req.get('host') + '/redeem';

        console.log("Redirect URL set:", redirectUrl !== undefined, "->" , redirectUrl)

        var tokenRequest = token.createTransferTokenRequest(form.amount, form.currency)
            .setDescription(form.description)
            .setToAlias(alias)
            .setToMemberId(member.memberId())
            .addDestination(destination)
            .setRedirectUrl(redirectUrl)
            .setCallbackState({a: 1}) // arbitrary data
            .setCSRFToken(nonce);
            
        var request = await member.storeTokenRequest(tokenRequest)
        var tokenRequestUrl = token.generateTokenRequestUrl(request.id)

        console.log("Token Request Created: ", tokenRequestUrl !== undefined, "->" , tokenRequestUrl)
        res.status(200).send(tokenRequestUrl);
    });

    // Redirect url, should match the onSuccess function on controller from frontend
    app.get('/redeem', async function (req, res) {

        console.log("------ Redeem Starting -------")

        // get token id from the previous request
        var data = req.query.data;
        var result = await token.parseTokenRequestCallbackParams(JSON.parse(data), req.session.nonce);
        var memberToken = await member.getToken(result.tokenId)

        // redeem
        var transfer = await member.redeemToken(memberToken)
        console.log("Redeem token response", transfer)
        res.status(200).send("Success!" + transfer.id);
    });

}

module.exports.init = Routes