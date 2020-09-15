const axios = require('axios');
const moment = require('moment-timezone');
class Game {
  constructor(data) {
    this.data = data
  }
  async init() {
    const url = 'https://jp.global.nba.com/stats2/game/snapshot.json?countryCode=JP&gameId=:id&locale=ja'.replace(':id', this.gameId())
    const res = await axios.get(url);
    this.snapshotData = res.data.payload
    //console.log(this.snapshotData)
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
    let team = this.isHome() ? this.data.homeTeam : this.data.awayTeam
    return team.profile.city + ' ' + team.profile.name
  }

  oppTeamName() {
    let team = this.isHome() ? this.data.awayTeam : this.data.homeTeam
    return team.profile.city + ' ' + team.profile.name
  }

  displayScore() {
    let score = this.data.teamScore + '-' + this.data.oppTeamScore
    return (this.isWon() ? '○' : '●') + score
  }

  dateTime() {
    console.log(this.data.profile.dateTimeEt)
    return moment.tz(this.data.profile.dateTimeEt, "America/New_York")
  }

  onCourtRosterCodes() {
    const players = this.snapshotData.homeTeam.gamePlayers.concat(this.snapshotData.awayTeam.gamePlayers)
    return players.filter((player) => {
      return player.boxscore.onCourt == 'true'
    }).map((player) => {
      return player.profile.code
    })
  }


  starterRosterCodes() {
    const players = this.snapshotData.homeTeam.gamePlayers.concat(this.snapshotData.awayTeam.gamePlayers)
    return players.filter((player) => {
      return player.boxscore.isStarter == 'true'
    }).map((player) => {
      return player.profile.code
    })
  }
}


module.exports = {
  Game
}
