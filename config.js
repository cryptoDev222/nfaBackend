const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: '127.0.0.1',
    user: 'root',
    password: '@blightfuture1',
    database: 'NfaBackend',
  },
  apeToken: "0x495f947276749ce646f68ac8c248420045cb7b5e",
  stakingPool: "0x07DE828Fe11D8d0fD4985C23a6eD6f71C111472E",
}
module.exports = config
