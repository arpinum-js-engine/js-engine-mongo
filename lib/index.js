module.exports = Object.assign(
  {mongo: require('./mongo')},
  require('./eventStore')
);
