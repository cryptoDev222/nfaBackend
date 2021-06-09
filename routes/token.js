'use strict'
const query = require('../dbHelper').query

var router = require('express').Router()

// add tokens if don't exist //////////////
router.post('/createtokens', function(req, res) {
  let data = req.body.addData
  let account = req.body.account
  const forLoop = async _=>{
    for(let i=0; i < data.length; i++) {
      await query('Insert into tb_tokens (`name`, `gender`, `token_id`, `account_id`, `chain_id`, `traits`) VALUES (?, ?, ?, ?, ?, ?)', [data[i]['name'], data[i]['gender'], data[i]['token_id'], account, data[i]['chainId'], data[i]['traits']])
    }
    res.json({message: "successfully!"})
  }
  forLoop()
})
// ////////////////////////////////////////

// get staked Tokens infomation////////////
router.get('/stakedTokens', async function(req, res) {
  let ids = JSON.parse(req.query.ids).join(',')
  let chainId = req.query.chainId
  let datas = []
  if(ids !== "")
    datas = await query('SELECT * from tb_tokens WHERE `token_id` IN (' + ids + ') and `chain_id`=?', [chainId])
  res.json(datas);
})
// /////////////////////////////////////////

// check if tokens exist and update account
router.put('/tokens', function(req, res) {
  let data = req.body
  let blankData = []
  const forLoop = async _=>{
    for(let i=0; i < data.ids.length; i++) {
      let datas = await query("Update tb_tokens set `account_id`=? where `token_id`=? and `chain_id`=?", [data.account, data.ids[i], data['chainId']])
      if( datas.affectedRows == 0 )
        blankData.push(data.ids[i])
    }
    res.json({ids: blankData})
  }
  forLoop()
})
// ////////////////////////////////////////

// get tokens from account_id and chain ID
router.put('/tokensFromID', async function(req, res) {
  let data = req.body
  let blankData = []
  const forLoop = async _=>{
    for(let i=0; i < data.ids.length; i++) {
      let datas = await query("Select * from tb_tokens where `token_id`=? and `chain_id`=?", [data.ids[i], data['chainId']])
      if( datas.length == 0 )
        blankData.push(data.ids[i])
    }
    res.json({ids: blankData})
  }
  forLoop()
})
// ////////////////////////////////////////

// initiate token///////////////////////////
router.put('/initiateToken', async function(req, res) {
  let data = req.body
  let blankData = []
  let result = await query("Update tb_tokens set `initiate_flag`=1, `class`=? where `token_id`=? and `chain_id`=?", [data['classIndex'], data['tokenId'], data['chainId']])

  res.json(result)
})
// ////////////////////////////////////////

// initiate token///////////////////////////
router.put('/initiateBaby', async function(req, res) {
  let data = req.body
  console.log(data)
  let result = await query("Update tb_tokens set `mother_id`=? where `token_id`=? and `chain_id`=?", [data['motherId'], data['babyId'], data['chainId']])

  res.json(result)
})
// ////////////////////////////////////////

// get tokens from account_id and chain ID
router.get('/tokens', async function(req, res) {
  let accountId = req.query.owner
  let chainId = req.query.chainId
  let datas = []
  datas = await query('SELECT * from tb_tokens WHERE `account_id` = ? and `chain_id`=?', [accountId, chainId])
  res.json({assets: datas});
})
// ////////////////////////////////////////

// get tokens from account_id and chain ID
router.get('/allTokens', async function(req, res) {
  let chainId = req.query.chainId
  let datas = []
  datas = await query('SELECT * from tb_tokens WHERE `chain_id`=? ORDER BY `initiate_flag` asc, `class` asc', [chainId])
  res.json(datas);
})
// ////////////////////////////////////////

// get initiated tokens from account_id and chain ID
router.get('/initiatedTokens', async function(req, res) {
  let accountId = req.query.owner
  let chainId = req.query.chainId
  let datas = []
  datas = await query('SELECT * from tb_tokens WHERE `account_id` = ? and `chain_id`=? and `initiate_flag` = 1', [accountId, chainId])
  res.json({assets: datas});
})
// ////////////////////////////////////////

// get tokens from token_id and chain ID
router.get('/tokens/:tokenId', async function(req, res) {
  let tokenId = req.params.tokenId
  let chainId = req.query.chainId
  let datas = []
  datas = await query('SELECT * from tb_tokens WHERE `token_id` = ? and `chain_id`=?', [tokenId, chainId])
  res.json(datas);
})
// ////////////////////////////////////////

router.get('/tokensForInitiate', async function(req, res) {
  let chainId = req.query.chainId
  let datas = []
  datas = await query('SELECT * from tb_tokens WHERE `chain_id`=? AND `initiate_flag` != 1', [chainId])

  res.json(datas)
})

router.get('/getBabiesForInitiate', async function(req, res) {
  let chainId = req.query.chainId
  let datas = []
  datas = await query('SELECT * from tb_tokens WHERE `chain_id`=? AND `initiate_flag` = 1 AND `mother_id`="" AND `gender` = 3', [chainId])

  res.json(datas)
})


module.exports = router
