const axios = require('axios');
class Roster {
  constructor(code) {
    this.code = code
  }
  async init() {
    const url = 'https://jp.global.nba.com/stats2/player/stats.json?ds=profile&locale=ja&playerCode=:code'.replace(':code', this.code)
    const res = await axios.get(url);
    this.data = res.data.payload
  }



}

module.exports = {
  Roster
}
