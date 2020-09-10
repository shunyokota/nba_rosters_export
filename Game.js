const axios = require('axios');
const moment = require('moment');
class Game {
  constructor(data) {
    this.data = data
  }

  gameId() {
    return this.data.profile.gameId
  }

  teamScore() {
    return this.data.teamScore
  }

  oppTeamScore() {
    return this.data.oppTeamScore
  }

  isWon() {
    return this.data.winOrLoss == 'Won'
  }
}


module.exports = {
  Game
}
