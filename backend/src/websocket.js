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