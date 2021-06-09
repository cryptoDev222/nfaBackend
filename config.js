const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: '127.0.0.1',
    user: 'root',
    password: '@blightfuture1',
    database: 'NfaBackend',
  },
  apeToken: "0x42F8666E87E509258E272D7C233cDE11AF78a8B1",
  stakingPool: "0x9F8be06E79b370Ff26dFCb4C00D872763B70FB01",
}
module.exports = config
