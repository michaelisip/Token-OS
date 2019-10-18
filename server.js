var express = require('express')

var app = express()
var PORT = 9000

var TokenConfiguration = require('./src/config/token-io')
var Middlewares = require('./src/middlewares/Middleware')
var Routes = require('./src/routes/api')

/**
 * Initialize configurations
 */
async function init() {

    // Token Configurations
    var { token, member, alias } = await TokenConfiguration.init()

    // Middlewares
    Middlewares.init(app)

    // Routes
    Routes.init(app, token, member, alias)

    // Listen
    app.listen(PORT, () => {
        console.log(`Server started on ${PORT}`);
    });
}

init()