const mysql = require('mysql');
const config = require('./config');

async function query(sql, params) {
  const connection = await mysql.createConnection(config.db)
  return new Promise(reslove => {
    connection.query({
      sql: sql,
      timeout: 40000, // 40s
      values: params
    }, async function (error, results, fields) {
      if(error)
        console.log(error)
      // error will be an Error if one occurred during the query
      // results will contain the results of the query
      // fields will contain information about the returned results fields (if any)
      connection.end()
      reslove(results)
    });
  })
}

async function insertStake(data) {
  let gender = await query("Select * from tb_tokens Where `token_id`=? and `chain_id`=?", [data.stakedId, data.chainId])
  let temp = await query('Select * from tb_tokens Where `token_id`=? and `chain_id`=? and `withdraw`=0', [data.stakedId, data.chainId])
  gender = gender[0].gender
  if(temp.length === 0) {
    let result = await query(
      "Insert into tb_stakes(`account_id`, `token_id`, `gender`, `withdraw`, `chain_id`, `stake_date`) VALUES (?, ?, ?, 0, ?, ?)",
      [data.account, data.stakedId, gender, data.chainId, new Date()]
    )
    return result
  }
}

async function withdraw(data) {
  let update = await query('Update tb_stakes set `withdraw`=1 where `account_id`=? and `chain_id`=?', [data['account_id'], data['chain_id']])

  return update
}

async function getRewards(data) {
  let temp = await query('Update tb_rewards set `eth_amount`= `eth_amount` + ? where `account_id`=? and `chain_id`=?', [data['rewardsAmount'], data['account'], data['chainId']])
    if(temp.affectedRows == 0)
      await query('Insert into tb_rewards (`account_id`, `eth_amount`, `chain_id`) VALUES (?, ?, ?)', [data['account'], data['rewardsAmount'], data['chainId']])

  return temp
}

async function getFemale(data) {
  let female = await query('Select * from tb_stakes where `account_id`=? and `chain_id`=? and `withdraw`=0 and `gender`=1', [data['account'], data['chainId']])

  return female
}

async function claimBaby(data) {
  let babyId = data.babyId
  let update = await query('Update tb_tokens set `baby_count`=`baby_count` + 1 where `token_id`=?', [data['femaleId']])
  let temp = await query('Update tb_tokens set `account_id`=? where `token_id`=? and `chain_id`=?', [data['accountId'], babyId, data['chainId']])
  if(temp.affectedRows == 0)
    await query('Insert into tb_tokens (`gender`, `token_id`, `account_id`, `chain_id`) VALUES (?, ?, ?, ?)', [3, babyId, data['accountId'], data['chainId']])

  temp = await query('Update tb_rewards set `baby_count`= `baby_count` + 1 where `account_id`=? and `chain_id`=?', [data['accountId'], data['chainId']])
    if(temp.affectedRows == 0)
      await query('Insert into tb_rewards (`account_id`, `baby_count`, `chain_id`) VALUES (?, ?, ?)', [data['accountId'], 1, data['chainId']])

  return true
}

async function initiateToken(data) {
  let result = await query("Update tb_tokens set `initiate_flag`=1, `class`=? where `token_id`=? and `chain_id`=?", [data['classIndex'], data['tokenId'], data['chainId']])

  return result
}

async function initiateBaby(data) {
  let result = await query("Update tb_tokens set `mother_id`=? where `token_id`=? and `chain_id`=?", [data['motherId'], data['babyId'], data['chainId']])

  return result
}

module.exports = {
  query,
  insertStake,
  getRewards,
  withdraw,
  getFemale,
  claimBaby,
  initiateToken,
  initiateBaby
}
