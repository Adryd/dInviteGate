const config = {
    discordClientID: 'xxxxxx',
    discordClientSecret: 'xxxxxx',
    discordToken: 'xxxxxx',
    apiBase: 'https://discordapp.com/api',
    apiAuthorize: '/oauth2/authorize',
    apiToken: '/oauth2/token',
    apiRevoke: '/oauth2/token/revoke',
    apiScopes: ['identify', 'email', 'guilds', 'guilds.join'],
    dbUrl: 'mongodb://localhost:27017/dgate',
    webappHost: 'localhost',
    webappPort: '1234'
}
module.exports = {
  discordClientID: config.discordClientID,
  discordClientSecret: config.discordClientSecret,
  discordToken: config.discordToken,
  apiBase: config.apiBase,
  apiAuthorize: config.apiAuthorize,
  apiToken: config.apiToken,
  apiRevoke: config.apiRevoke,
  apiScope: config.apiScopes.join(' '),
  dbUrl: config.dbUrl,
  webappHost: config.webappDomain,
  webappPort: config.webappPort,
  webappUri: `http://${config.webappHost}:${config.webappPort}`
}
