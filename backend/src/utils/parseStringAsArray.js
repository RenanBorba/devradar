module.exports = function parseStringAsArray(arrayAsString){
  // Identificar elementos no array após vírgula e eliminar espaços em branco
  return arrayAsString.split(',').map(tech => tech.trim());
};