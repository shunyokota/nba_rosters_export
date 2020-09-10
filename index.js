const axios = require('axios');
const _ = require('lodash');
const TEAM_LIST_URL = 'https://jp.global.nba.com/stats2/league/conferenceteamlist.json?locale=ja';
const ROSTERS_URL = 'https://jp.global.nba.com/stats2/team/roster.json?locale=ja&teamCode=:code'
const SCHEDULE_URL = 'https://jp.global.nba.com/stats2/team/schedule.json?countryCode=JP&locale=ja&teamCode=:code'
const STATS_URL = 'https://jp.global.nba.com/stats2/player/stats.json?ds=profile&locale=ja&playerCode=:code'
const {Roster} = require('./Roster')

const HISTORY_LEN = 5;
const teamCode1 = process.argv[2];

const teamList = async () => {
  const res = await axios.get(TEAM_LIST_URL);
  console.log(_(res.data.payload.listGroups).flatMap('teams').value());
}

const rosterCodeList = async (code) => {
  const res = await axios.get(ROSTERS_URL.replace(':code', code));
  return _(res.data.payload.players).map('profile').map('code').value();
}

const scheduleList = async (code) => {
  const res = await axios.get(SCHEDULE_URL.replace(':code', code));
  return _(res.data.payload.monthGroups)
    .flatMap('games')
    .filter((game) => {
      return game.winOrLoss !== null;
    })
    .sortBy((game) => {
      return game.profile.dateTimeEt
    })
    .reverse()
    .slice(0, HISTORY_LEN)
    .value()
}

const statsList = async (code) => {
  const res = await axios.get(STATS_URL.replace(':code', code));
  console.log(res.data.payload);
  return _(res)
    .value()
}

const main = async () => {
  const rosterCodes = await rosterCodeList(teamCode1);
  //const rosters = []

  const rosters = await Promise.all(rosterCodes.map(
    async code => {
      let roster = new Roster(code);
      await roster.init()
      return roster
    }
    )
  )
  //   rosterCodes.map(async code => {
  //   return await statsList(code)
  // });
  console.log(rosters);
}

main();
//console.log(rosterCodeList(teamCode1));
//console.log();
//console.log(Roster)
//console.log(statsList('marcus_morris'));
