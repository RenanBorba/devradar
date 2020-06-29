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