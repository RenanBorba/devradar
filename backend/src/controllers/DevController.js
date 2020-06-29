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