'use strict'
const query = require('../dbHelper').query

var router = require('express').Router()

// get all staked list//////////////////////
router.get('/allStaked', async function(req, res) {
  let data = req.query
  let result = await query(
    "SELECT COUNT(`gender`) as count, gender from tb_stakes WHERE `account_id`=? and `chain_id`=? GROUP BY `gender`",
    [data.account, data.chainId]
  )

  res.json(result)
})
// /////////////////////////////////////////

// insert stake history ////////////////////
router.post('/stakes', async function(req, res) {
  let data = req.body
  let gender = await query("Select * from tb_tokens Where `token_id`=? and `chain_id`=?", [data.stakedId, data.chainId])
  gender = gender[0].gender
  let result = await query(
    "Insert into tb_stakes(`account_id`, `token_id`, `gender`, `withdraw`, `chain_id`, `stake_date`) VALUES (?, ?, ?, 0, ?, ?)",
    [data.account, data.stakedId, gender, data.chainId, new Date()]
  )
  res.json(result)
})
// /////////////////////////////////////////

// get staked List//////////////////////////
router.get('/stakedList', async function(req, res) {
  let chainId = req.query.chainId
  let result = await query("Select Distinct stakes.*, tokens.baby_count, tokens.name, tokens.img_url from tb_stakes as stakes LEFT JOIN tb_tokens as tokens ON stakes.token_id = tokens.token_id where `withdraw` = 0 AND stakes.chain_id=?", chainId)
  let initiatedBabyCount = await query("select COUNT(mother_id) as babyCount, mother_id from tb_tokens where mother_id != '' group by mother_id")

  res.json({result: result, babyCount: initiatedBabyCount})
})
// /////////////////////////////////////////

// get staked history//////////////////////////
router.get('/stakeHistory', async function(req, res) {
  let chainId = req.query.chainId
  let result = await query("Select tb_stakes.*, tb_tokens.name, tb_tokens.img_url from tb_stakes LEFT JOIN tb_tokens ON tb_stakes.token_id = tb_tokens.token_id where tb_stakes.chain_id=? ORDER BY ID DESC", chainId)

  res.json(result)
})
// /////////////////////////////////////////

module.exports = router
