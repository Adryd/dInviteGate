const express = require('express');
const config = require('./config.js');
const fetch = require('snekfetch');
const btoa = require('btoa');
const db = require('mongodb').MongoClient;
const assert = require('assert');

db.connect(config.dbUrl, function(err, db) {
  assert.equal(null, err);
  console.info("Connected to db");

  const app = express();

  app.get('/', function(req, res) {
    console.log();
    res.send('<a href="/auth">Log in with Discord</a>');
  });

  let redirectUri = encodeURIComponent(`${config.webappUri}/auth/callback`)
  app.get('/auth', function(req, res) {
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.discordClientID}&scope=${config.apiScope}&response_type=code&redirect_uri=${redirectUri}`);
  });
  app.get('/auth/callback', async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${config.discordClientID}:${config.discordClientSecret}`);
    const auth = await fetch.post(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`, {headers: {
      Authorization: `Basic ${creds}`,
    }})
    const jsonAuth = JSON.parse(auth.text)
    if (jsonAuth.scope !== "identify email guilds guilds.join") {
      res.send('bad scope')
      return;
    }
    const user = await fetch.get(`https://discordapp.com/api/users/@me`, {headers: {
      Authorization: `Bearer ${jsonAuth.access_token}`,
    }})
    const jsonUser = JSON.parse(user.text)
    var userst = {}
    userst[jsonUser.id] = {
      refresh_token: jsonAuth.refresh_token,
      username: jsonUser.username,
      discriminator: jsonUser.discriminator,
      email: jsonUser.email,
      avatar: jsonUser.avatar
    }
    insertDocuments(db,userst)
  });

  app.listen(config.webappPort)
});

var insertDocuments = function(db, data) {
  var collection = db.collection('users');
  collection.insert(data);
}
