'use strict'
const simple = require('./handlers/simple')
const configured = require('./handlers/configured')
const query = require('./dbHelper').query

const rewardsRouter = require('./routes/rewards')
const tokenRouter = require('./routes/token')
const stakeRouter = require('./routes/stake')
const accountRouter = require('./routes/account')

module.exports = function (app, opts) {
  // Setup routes, middleware, and handlers
  app.get('/api', simple)
  app.get('/configured', configured(opts))

  // enable routers//
  app.use('/api', rewardsRouter)
  app.use('/api', tokenRouter)
  app.use('/api', stakeRouter)
  app.use('/api', accountRouter)
  // ///////////////////////

}
