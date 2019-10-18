var express = require('express')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')

function Middlewares(app) {

    console.log("---- Middlewares Config ----")

    app.use(express.static('src/public'));
    app.use(bodyParser.json({ extended: false }));
    app.use(cookieSession({
        name: 'session',
        keys: [
            'cookieSessionKey'
        ],
        maxAge: 24 * 60 * 60 * 1000
    }));

    // custom middlewares
}

module.exports.init = Middlewares