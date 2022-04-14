const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const fetch = require("node-fetch");
const PORT = process.env.PORT || 5000;

const BAD_DATA_ERROR = "Bad data from Steam API";
const CANNOT_CONNECT_TO_API = "Cannot connect to Steam API";

express()
  .use(bodyParser.json())
  .use(cors())
  .use(morgan("combined"))
  .get("/api", async (req, res) => {
    const key = req.query.key;
    const steamId = req.query.steamId;
    if (!key || !steamId) return res.send("Missing parameters");
    getPlayedTime(key, steamId).then(playtime => res.send(String(playtime)));
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

async function getPlayedTime(key, steamId) {
  const url = `http://api.steampowered.com/IPlayerService/GetOwnedGamess/v0001?key=${key}&format=json&input_json={%22steamid%22:%20${steamId},%22appids_filter%22:%20[381210]}`;

   return fetch(url)
    .then((res) => res.json())
    .then((json) => {
      const playtime = json?.response?.games[0]?.playtime_forever;
      if(playtime) {
        return Math.round(playtime / 60);
      } else {
         throw BAD_DATA_ERROR;
      }
    })
    .catch(err => {
      console.log(err);
      return CANNOT_CONNECT_TO_API;
    });
}