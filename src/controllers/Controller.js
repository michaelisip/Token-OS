var fs = require('fs');

/**
 * Not used
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

var TokenConfiguration = require('../config/token-io')
var { token, member, alias } = TokenConfiguration.init()

async function index(req, res) {
    fs.readFile('src/public/index.html', 'utf-8', function(err, contents) {
        if(err) console.error(err)
        res.set('Content-Type', 'text/html')
        res.send(contents);
    })
}

async function transfer(req, res) {

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
}

async function redeem(req, res) {

    console.log("------ Redeem Starting -------")

    // get token id from the previous request
    var data = req.query.data;
    var result = await token.parseTokenRequestCallbackParams(JSON.parse(data), req.session.nonce);
    var token = await member.getToken(result.tokenId)

    // redeem
    var transfer = await member.redeemToken(token)
    console.log("Redeem token response", transfer)
    res.status(200).send("Success!" + transfer.id);
}

module.exports = {
    index,
    transfer,
    redeem
}