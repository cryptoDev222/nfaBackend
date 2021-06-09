'use strict'
const query = require('../dbHelper').query

var router = require('express').Router()

// sync accounts with tokens counts /////
router.put('/accounts', async function(req, res) {
  let data = req.body
  let result = await query(
    "Update tb_accounts set `female_count`=?, `male_count`=?, `baby_count`=? Where `account_id`=? and `chain_id`=?",
    [data.female, data.male, data.baby, data.account, data.chainId]
  )
  if(result.affectedRows == 0)
    result = await query(
      "Insert into tb_accounts(`account_id`, `female_count`, `male_count`, `baby_count`, `chain_id`) VALUES (?, ?, ?, ?, ?)",
      [data.account, data.female, data.male, data.baby, data.chainId]
    )
  res.json(result)
})
// //////////////////////////////////////

module.exports = router
