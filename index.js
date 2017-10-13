const express = require('express');
const config = require('./config.js');
const fetch = require('snekfetch');
const btoa = require('btoa');
const path = require('path');

const app = express();

let redirectUri = encodeURIComponent(`${config.webappUri}/auth/callback`)
app.get('/', function(req, res) {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.discordClientID}&scope=${config.apiScope}&response_type=code&redirect_uri=${redirectUri}`);
});

app.get('/auth/callback', async(req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const creds = btoa(`${config.discordClientID}:${config.discordClientSecret}`);
  const authReq = await fetch.post(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`, {
    headers: {
      Authorization: `Basic ${creds}`,
    }
  })
  const auth = JSON.parse(authReq.text);
  const userReq = await fetch.post(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`, {
    headers: {
      Authorization: `Bearer ${auth.authorization_code}`,
    }
  })
  const user = JSON.parse(userReq.text);
  // At this point we store an object in a database similar to the one below
  // This will allow us to invite them at any point, perhaps inviting multiple users in waves after being approved
  // Another idea I had was to allow for applications to contain a comment or something so it can be used to replace the memework #recruits channel
  const thingtowritetodb = {
    12345: { // replace 12345 with user id
      refresh_token: auth.refresh_token,
      username: user.username,
      discrim: user.discriminator,
      avatar: user.avatar, // add condition if user.avatar is undefined
      email: user.email // same here
    }
  }
  req.redirect(`/submit?token=${auth.access_token}`)
});

app.get('/submit', async(req, res) => {
  if (!req.query.token) throw new Error('NoCodeProvided');
  const token = req.query.token;
  const invite = await fetch.post(`https://discordapp.com/api/invites/G76FYaR`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  res.send('ok')
});

app.listen(config.webappPort)
