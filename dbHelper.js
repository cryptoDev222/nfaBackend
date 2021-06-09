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
  gender = gender[0].gender
  let result = await query(
    "Insert into tb_stakes(`account_id`, `token_id`, `gender`, `withdraw`, `chain_id`, `stake_date`) VALUES (?, ?, ?, 0, ?, ?)",
    [data.account, data.stakedId, gender, data.chainId, new Date()]
  )
  return result
}

async function getRewards(data) {
  let update = await query('Update tb_stakes set `withdraw`=1 where `account_id`=? and `chain_id`=?', [data['account_id'], data['chain_id']])

  let temp = await query('Update tb_rewards set `eth_amount`= `eth_amount` + ? where `account_id`=? and `chain_id`=?', [data['rewardsAmount'], data['account_id'], data['chain_id']])
    if(temp.affectedRows == 0)
      await query('Insert into tb_rewards (`account_id`, `eth_amount`, `chain_id`) VALUES (?, ?, ?)', [data['account_id'], data['rewardsAmount'], data['chain_id']])

  return temp
}

module.exports = {
  query,
  insertStake,
  getRewards
}
