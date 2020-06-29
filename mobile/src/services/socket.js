import socketio from 'socket.io-client';

const socket = socketio('http://192.168.0.104:3333', {
  autoConnect: false
});

function subscribeToNewDevs( subscribeFunction ) {
  // Ouvir message 'new-dev' do websocket da api
  socket.on('new-dev', subscribeFunction)
};

// Conexão Websocket
function connect( latitude, longitude, techs ) {
  // Enviar params
  socket.io.opts.query = {
    latitude,
    longitude,
    techs
  };

  socket.connect();
}

function disconnect() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export
  {
    connect,
    disconnect,
    subscribeToNewDevs
  };
