const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: '127.0.0.1',
    user: 'root',
    password: '@blightfuture1',
    database: 'NfaBackend',
  },
  apeToken: "0x495f947276749ce646f68ac8c248420045cb7b5e",
  stakingPool: "0x5735f0c13ddeb10d824437ea01f706d756cdd011",
}
module.exports = config
