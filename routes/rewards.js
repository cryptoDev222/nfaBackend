'use strict'
const query = require('../dbHelper').query

var router = require('express').Router()

// claim baby ///////////////////////////
router.post('/claimBaby', async function(req, res) {
  let data = req.body.femaleData
  let babyId = req.body.babyId
  let update = await query('Update tb_tokens set `baby_count`=? where `token_id`=?', [(data['baby_count'] + 1), data['token_id']])
  let temp = await query('Update tb_tokens set `account_id`=? where `token_id`=? and `chain_id`=?', [data['account_id'], babyId, data['chain_id']])
  if(temp.affectedRows == 0)
    await query('Insert into tb_tokens (`gender`, `token_id`, `account_id`, `chain_id`) VALUES (?, ?, ?, ?)', [3, babyId, data['account_id'], data['chain_id']])

  temp = await query('Update tb_rewards set `baby_count`= `baby_count` + 1 where `account_id`=? and `chain_id`=?', [data['account_id'], data['chain_id']])
    if(temp.affectedRows == 0)
      await query('Insert into tb_rewards (`account_id`, `baby_count`, `chain_id`) VALUES (?, ?, ?)', [data['account_id'], 1, data['chain_id']])

  res.json({message: "Successfully!"})
})
// //////////////////////////////////////

// get Rewards /////////////////////////////
router.post('/getRewards', async function(req, res) {
  let data = req.body
  let update = await query('Update tb_stakes set `withdraw`=1 where `account_id`=? and `chain_id`=?', [data['account_id'], data['chain_id']])

  let temp = await query('Update tb_rewards set `eth_amount`= `eth_amount` + ? where `account_id`=? and `chain_id`=?', [data['rewardsAmount'], data['account_id'], data['chain_id']])
    if(temp.affectedRows == 0)
      await query('Insert into tb_rewards (`account_id`, `eth_amount`, `chain_id`) VALUES (?, ?, ?)', [data['account_id'], data['rewardsAmount'], data['chain_id']])

  res.json({message: "Successfully!"})
})
// ////////////////////////////////////////

// get Rewards List/////////////////////////////
router.get('/rewardsList', async function(req, res) {
  let chainId = req.query.chainId
  let result = await query('Select * from tb_rewards where `chain_id`=?', [chainId])

  res.json(result)
})
// ////////////////////////////////////////

module.exports = router
