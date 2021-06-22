const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: '127.0.0.1',
    user: 'root',
    password: '@blightfuture1',
    database: 'NfaBackend',
  },
  apeToken: "0x495f947276749ce646f68ac8c248420045cb7b5e",
  stakingPool: "0x3bccbbde5b9ca293e065aa17cc3123f24b4e005b",
}
module.exports = config
