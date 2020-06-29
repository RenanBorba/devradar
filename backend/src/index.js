const express = require('express');
const mongoose = require ('mongoose');
const cors = require('cors')
const http = require('http');

const { setupWebsocket } = require('./websocket');
const routes = require('./routes');

const app = express();
const server = http.Server(app);

setupWebsocket(server);

mongoose.connect('mongodb+srv://omnistack:omnistack@omnistack10-60cwf.mongodb.net/week10?retryWrites=true&w=majority', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());/*({ origin: 'http:/localhost:3000'}))*/

// Requisições com corpo no formato json
app.use(express.json());

app.use(routes);

server.listen(3333);