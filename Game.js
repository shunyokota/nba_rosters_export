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

  isHome() {
    return this.data.isHome == 'true'
  }

  teamName() {
    let oppTeam = this.isHome() ? this.data.homeTeam : this.data.awayTeam
    return oppTeam.profile.name
  }

  oppTeamName() {
    let oppTeam = this.isHome() ? this.data.awayTeam : this.data.homeTeam
    return oppTeam.profile.name
  }

  displayScore() {
    let score = this.data.teamScore + '-' + this.data.oppTeamScore
    return (this.isWon() ? '○' : '●') + score
  }

}


module.exports = {
  Game
}
