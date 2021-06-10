'use strict'
const express = require('express')
const httpErrors = require('http-errors')
const pino = require('pino')
const pinoHttp = require('pino-http')
const cors = require('cors')
const Web3 = require('web3')
var bodyParser = require('body-parser')
const stakingAbi = require('./abis/StakingPool.json')
const stakingAddress = require('./config').stakingPool
const insertStake = require('./dbHelper').insertStake
const getRewards = require('./dbHelper').getRewards

let web3 = null
const chainId = '0x1' //for rinkeby

// try {
//   web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/fff5ada5a7dd49b58db10ec9db89d12e'))
// } catch (err) {
//   console.log(err)
// }
//
// if(web3 !== null) {
//   let stakingPool = new web3.eth.Contract(stakingAbi, stakingAddress)
//   // staking Operation
//   let pastStaked = []
//   setInterval(() => {
//     stakingPool.getPastEvents('Staked', () => {})
//       .then((event) => {
//         if(JSON.stringify(pastStaked) != JSON.stringify(event)) {
//           let stakedIds = event
//           if(stakedIds.length === 0) return
//           stakedIds.forEach((stakedId) => {
//             insertStake({account: stakedId.returnValues[0], stakedId: stakedId.returnValues[1], chainId: chainId})
//           });
//           pastStaked = event
//         }
//       })
//   }, 1000)
//
//   // claim baby
//   let claimedBaby = []
//   setInterval(() => {
//     stakingPool.getPastEvents('Claimed', () => {})
//       .then((event) => {
//         if(JSON.stringify(claimedBaby) != JSON.stringify(event)) {
//           let babies = event
//           console.log(babies)
//           if(babies.length === 0) return
//           claimedBaby = event
//         }
//       })
//   }, 1000)

//   // Withdrawn
//   let withdrawn = []
//   setInterval(() => {
//     stakingPool.getPastEvents('Withdrawn', () => {})
//       .then((event) => {
//         if(JSON.stringify(withdrawn) != JSON.stringify(event)) {
//           let withdrawnData = event
//           let accountIds = []
//           if(withdrawnData.length === 0) return
//           withdrawnData.forEach((data) => {
//             if(!accountIds.includes(data.returnValues[0]))
//               accountIds.push(data.returnValues[0])
//           });
//           accountIds.forEach((account) => {
//             getRewards({account_id: account, chain_id: chainId, rewardsAmount: 0})
//           })
//           withdrawn = event
//         }
//       })
//   }, 1000)
// }

module.exports = function main (options, cb) {
  // Set default options
  const ready = cb || function () {}
  const opts = Object.assign({
    // Default options
  }, options)

  const logger = pino()

  // Server state
  let server
  let serverStarted = false
  let serverClosing = false

  // Setup error handling
  function unhandledError (err) {
    // Log the errors
    logger.error(err)

    // Only clean up once
    if (serverClosing) {
      return
    }
    serverClosing = true

    // If server has started, close it down
    if (serverStarted) {
      server.close(function () {
        process.exit(1)
      })
    }
  }
  process.on('uncaughtException', unhandledError)
  process.on('unhandledRejection', unhandledError)

  // Create the express app
  const app = express()

  // setting cors
  app.use(cors())

  // enable body parser
  app.use(bodyParser.json())

  // Common middleware
  // app.use(/* ... */)
  // app.use(pinoHttp({ logger }))

  // Register routes
  // @NOTE: require here because this ensures that even syntax errors
  // or other startup related errors are caught logged and debuggable.
  // Alternativly, you could setup external log handling for startup
  // errors and handle them outside the node process.  I find this is
  // better because it works out of the box even in local development.
  require('./routes')(app, opts)

  // Common error handlers
  app.use(function fourOhFourHandler (req, res, next) {
    next(httpErrors(404, `Route not found: ${req.url}`))
  })
  app.use(function fiveHundredHandler (err, req, res, next) {
    if (err.status >= 500) {
      logger.error(err)
    }
    res.status(err.status || 500).json({
      messages: [{
        code: err.code || 'InternalServerError',
        message: err.message
      }]
    })
  })

  // Start server
  server = app.listen(opts.port, opts.host, function (err) {
    if (err) {
      return ready(err, app, server)
    }

    // If some other error means we should close
    if (serverClosing) {
      return ready(new Error('Server was closed before it could start'))
    }

    serverStarted = true
    const addr = server.address()
    logger.info(`Started at ${opts.host || addr.host || 'localhost'}:${addr.port}`)
    ready(err, app, server)
  })
}
