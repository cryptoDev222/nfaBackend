'use strict'
const express = require('express')
const httpErrors = require('http-errors')
const pino = require('pino')
const pinoHttp = require('pino-http')
const cors = require('cors')
const Web3 = require('web3')
var bodyParser = require('body-parser')
const stakingAbi = require('./abis/StakingPoolNew.json')
const stakingAddress = require('./config').stakingPool
const insertStake = require('./dbHelper').insertStake
const withdraw = require('./dbHelper').withdraw
const getRewards = require('./dbHelper').getRewards
const getFemale = require('./dbHelper').getFemale
const claimBaby = require('./dbHelper').claimBaby
const initiateToken = require('./dbHelper').initiateToken
const initiateBaby = require('./dbHelper').initiateBaby

let web3 = null
const chainId = '0x1' //for mainnet

try {
  web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/fff5ada5a7dd49b58db10ec9db89d12e'))
} catch (err) {
  console.log(err)
}
//
if(web3 !== null) {
  let stakingPool = new web3.eth.Contract(stakingAbi, stakingAddress)
  // staking Operation
  let pastStaked = []
  let events = []
  setInterval(() => {
    stakingPool.getPastEvents("allEvents", () => {})
      .then((event) => {
        if(JSON.stringify(events) != JSON.stringify(event)) {

          let stakedIds = event.filter(eve => eve.event === "Staked")

          if(stakedIds.length !== 0) {
            stakedIds.forEach((stakedId) => {
              insertStake({account: stakedId.returnValues[0], stakedId: stakedId.returnValues[1], chainId: chainId})
            });
          }

          let withdrawnData = event.filter(eve => eve.event === "Withdrawn")
          let accountIds = []
          if(withdrawnData.length !== 0) {
            withdrawnData.forEach((data) => {
              if(!accountIds.includes(data.returnValues[0]))
                accountIds.push(data.returnValues[0])
            });
            accountIds.forEach((account) => {
              withdraw({account_id: account, chain_id: chainId, rewardsAmount: 0})
            })
          }

          let babies = event.filter(eve => eve.event === "Claimed")

          if(babies.length !== 0) {
            babies.forEach(async (baby) => {
              const account = baby.returnValues[0]
              const babyId = baby.returnValues[1]
              let femaleData = await getFemale({account, chainId})
              femaleData = femaleData[0]['token_id']
              claimBaby({accountId: account, babyId, chainId, femaleId: femaleData})
            })
          }

          let rewards = event.filter(eve => eve.event === "RewardPaid")

          if(rewards.length !== 0) {
            rewards.forEach(rewards => {
              const account = rewards.returnValues[0]
              const rewardsAmount = rewards.returnValues[1]

              getRewards({account, rewardsAmount, chainId})
            })
          }

          let females = event.filter(eve => eve.event === "FemaleInitiated")

          if(females.length !== 0) {
            females.forEach(female => {
              let babyCount = female.returnValues[1]
              let classIndex = babyCount == 6 ? 3 : babyCount == 4 ? 2 : 1
              initiateToken({classIndex, tokenId: female.returnValues[0], chainId})
            })
          }

          let males = event.filter(eve => eve.event === "MaleInitiated")

          if(males.length !== 0) {
            males.forEach(male => {
              let multiplier = male.returnValues[1]
              let classIndex = multiplier == 4 ? 3 : multiplier == 3 ? 2 : 1
              initiateToken({classIndex, tokenId: male.returnValues[0], chainId})
            })
          }

          let initiatedBabies = event.filter(eve => eve.event === "BabyInitiated")

          if(initiatedBabies.length !== 0) {
            initiatedBabies.forEach(baby => {
              initiateToken({classIndex: 1, tokenId: baby.returnValues.babyId, chainId})
            })
          }

          let babyMatched = event.filter(eve => eve.event === "BabyMatched")

          if(babyMatched.length !== 0) {
            babyMatched.forEach(matched => {
              let motherId = matched.returnValues[0]
              let babyId = matched.returnValues[1]
              initiateBaby({motherId, babyId, chainId})
            })
          }

          events = event;
        }
      })
  }, 3000)
}

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
