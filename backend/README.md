<div align="center">

## Rocketseat - Semana OmniStack 10.0
# Projeto - API Node Armazenamento DevRADAR Devs

</div>

<br>

<div align="center">

[![Generic badge](https://img.shields.io/badge/Made%20by-Renan%20Borba-purple.svg)](https://shields.io/) [![Build Status](https://img.shields.io/github/stars/RenanBorba/devradar.svg)](https://github.com/RenanBorba/devradar) [![Build Status](https://img.shields.io/github/forks/RenanBorba/devradar.svg)](https://github.com/RenanBorba/devradar) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

</div>

<br>

API REST de dados Back-end em Node.js MVC, desenvolvida para a aplicação DevRADAR, voltada para cadastro (web) e busca de devs de acordo com as tecnologias filtradas no raio de até 10km, permitindo, assim, a atualização em tempo real na versão mobile (mobile) via WebSocket.

<br><br>

## :rocket: Tecnologias
<ul>
  <li>Nodemon</li>
  <li>MongoDB</li>
  <li>Mongoose</li>
  <li>Express</li>
  <li>Routes</li>
  <li>Axios</li>
  <li>Github API</li>
  <li>Cors</li>
  <li>socket.io WebSocket</li>
</ul>

<br><br>

## :arrow_forward: Start
<ul>
  <li>npm install</li>
  <li>npm run dev / npm dev</li>
</ul>

<br><br><br>

## :mega: ⬇ Abaixo, as principais estruturas:

<br><br><br>

## src/index.js
```js
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
```


<br><br>


## src/routes.js
```js
const { Router } = require('express');
const DevController = require('./controllers/DevController');
const SearchController = require('./controllers/SearchController');

const routes = Router();

// Métodos HTTP: GET, POST
routes.get('/devs', DevController.index);
routes.post('/devs', DevController.store);
routes.get('/search', SearchController.index);

module.exports = routes;
```


<br><br>


## src/models/Dev.js
```js
const mongoose = require('mongoose');
const PointSchema = require('./utils/PointSchema');

const DevSchema = new mongoose.Schema({
  name: String,
  github_username: String,
  bio: String,
  avatar_url: String,
  techs: [String],
  location: {
    type: PointSchema,
    index: '2dsphere'
  }
});

module.exports = mongoose.model('Dev', DevSchema);
```


<br><br>


 ## src/models/utils/PointSchema.js
```js
const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    // 'location.type' deve ser 'Point' ou 'Polygon'
    enum: ['Point'],
    required: true
  },

  coordinates: {
    type: [Number],
    required: true
  }
});

module.exports = PointSchema;
```


<br><br>


## src/controllers/DevController.js
```js
const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

/* Tipos de Paramêtros:
 * Query Params: req.query (Filtros, Ordenação, Paginação)
 * Route Params: req.params (Identificar recurso na Alteração ou Remoção)
 * Body: Corpo da Requisição: req.body (Dados para Criação ou Alteração de registro)
 */

module.exports = {
  // Método Listar
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },

  // Método Criar
  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });
    if (!dev) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

      // Associar dados vindos da api do Github
      // Se não existir name, associar com login
      const { name = login, avatar_url, bio } = apiResponse.data;

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      });

      /*
       * Filtrar conexões há no máximo 10km de distância
       * e com pelo menos uma das tecnologias filtradas
       */

      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray
      )

      //console.log(sendSocketMessageTo);
      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }

    return res.json(dev);
  }
};
```


<br><br>


## src/controllers/SearchController.js
```js
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

/* Tipos de Paramêtros:
 * Query Params: req.query (Filtros, Ordenação, Paginação)
 * Route Params: req.params (Identificar recurso na Alteração ou Remoção)
 * Body: Corpo da Requisição: req.body (Dados para Criação ou Alteração de registro)
 */

module.exports = {
  // Método Buscar
  async index(req, res) {
    /*
     * Buscar devs num raio de 10km
     * Filtrar por Tecnologia
     */

    const{ latitude, longitude, techs } = req.query;

    const techsArray = parseStringAsArray(techs);

    const devs = await Dev.find({
      techs: {
        // EM (Mongo operator)
        $in: techsArray
      },

      location: {
        // PERTO (Mongo operator)
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          // DISTÂNCIA MÁX (Mongo operator)
          // 10000m = 10km
          $maxDistance: 10000
        }
      }
    });

    return res.json({ devs });
  }
};
```


<br><br>


## src/websocket.js
```js

const socketio = require('socket.io');

const parseStringAsArray =
  require('./utils/parseStringAsArray');

const calculateDistance =
  require('./utils/calculateDistance');

let io;
const connections = [];

exports.setupWebsocket = ( server ) => {
  io = socketio(server);

  // Conexão Websocket
  io.on('connection', socket => {
    /*
    console.log(socket.id);
    // params
    console.log(socket.handshake.query);
    setTimeout(() => {
      socket.emit('message', 'Hello Dev')
    }, 3000);
    */

    const
      { latitude,
        longitude,
        techs
      }
    = socket.handshake.query

    connections.push({
      id: socket.id,
      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },
      techs: parseStringAsArray(techs)
    })
  });
};

exports.findConnections = ( coordinates, techs ) => {
  return connections.filter(connection => {
    /*
     * Calcular distância entre coordenadas do novo dev cadastrado
     * com as coordenadas armazenadas em cada conexão
     */
    return calculateDistance(coordinates, connection.coordinates) < 10
      // E verificar se há pelo menos uma tecnologia filtrada
      && connection.techs.some(item => techs.includes(item))
  })
};

exports.sendMessage = ( to, message, data ) => {
  to.forEach(connection => {
    // Enviar mensagem para connection.id
    io.to(connection.id).emit(message, data)
  })
}
```
