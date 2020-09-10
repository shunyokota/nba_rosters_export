const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
class Roster {
  constructor(code) {
    this.code = code
  }
  async init() {
    const url = 'https://jp.global.nba.com/stats2/player/stats.json?ds=profile&locale=ja&playerCode=:code'.replace(':code', this.code)
    const res = await axios.get(url);
    this.data = res.data.payload
    this.seasonGames = this.data.player.stats.seasonGames
  }

  position() {
    return this.data.player.playerProfile.position
  }

  displayName() {
    return this.data.player.playerProfile.displayName
  }

  jerseyNo() {
    return this.data.player.playerProfile.jerseyNo
  }

  height() {
    return this.data.player.playerProfile.height
  }

  weight() {
    return this.data.player.playerProfile.weight
  }

  dayOfBirth() {
    return moment.unix(this.data.player.playerProfile.dob / 1000)
  }

  experienceYears() {
    return this.data.player.playerProfile.experience
  }

  gameInfo(gameId) {
    return _.find(this.seasonGames, (game) => {
      return game.profile.gameId == gameId
    })
  }

  mins(gameId) {
    const gameInfo = this.gameInfo(gameId)
    if (!gameInfo) {
      return null
    }
    return gameInfo.statTotal.mins
  }

  points(gameId) {
    const gameInfo = this.gameInfo(gameId)
    if (!gameInfo) {
      return null
    }
    return gameInfo.statTotal.points
  }

  threePm(gameId) {
    const gameInfo = this.gameInfo(gameId)
    if (!gameInfo) {
      return null
    }
    return gameInfo.statTotal.tpm
  }

  threePa(gameId) {
    const gameInfo = this.gameInfo(gameId)
    if (!gameInfo) {
      return null
    }
    return gameInfo.statTotal.tpa
  }
}

module.exports = {
  Roster
}
