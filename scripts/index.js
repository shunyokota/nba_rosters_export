const axios = require('axios');
const _ = require('lodash');
const fs = require('fs')
const moment = require('moment-timezone');
const TEAM_LIST_URL = 'https://jp.global.nba.com/stats2/league/conferenceteamlist.json?locale=ja';
const ROSTERS_URL = 'https://jp.global.nba.com/stats2/team/roster.json?locale=ja&teamCode=:code'
const SCHEDULE_URL = 'https://jp.global.nba.com/stats2/team/schedule.json?countryCode=JP&locale=ja&teamCode=:code'
const STATS_URL = 'https://jp.global.nba.com/stats2/player/stats.json?ds=profile&locale=ja&playerCode=:code'
const {Roster} = require('./Roster')
const {Game} = require('./Game')
const ROSTER_START_ROW = 6
const path = require('path')

var Excel = require('exceljs');
var workbook = new Excel.Workbook();

const HISTORY_LEN = 5;

const getLogoImagePath = (abbr) => {
  return path.join(__dirname, `../img/logo/${abbr}_logo.png`) //`./img/logo/${abbr}_logo.png`
}
const teamList = async () => {
  const res = await axios.get(TEAM_LIST_URL);
  return _(res.data.payload.listGroups).flatMap('teams').map('profile').value();
}

const rosterCodeList = async (code) => {
  const res = await axios.get(ROSTERS_URL.replace(':code', code));
  return _(res.data.payload.players).map('profile').map('code').value();
}
let logImagePath = ''
const gameList = async (code) => {
  const res = await axios.get(SCHEDULE_URL.replace(':code', code));
  logImagePath = getLogoImagePath(res.data.payload.profile.abbr)
  const games = _(res.data.payload.monthGroups)
    .flatMap('games')
    .filter((game) => {
      return game.winOrLoss !== null;
    })
    .sortBy((game) => {
      return game.profile.dateTimeEt
      return game.profile.dateTimeEt
    })
    .reverse()
    .slice(0, HISTORY_LEN)
    .map((gameRaw) => {
      return new Game(gameRaw)
    })
    .value()
  return games
}

const statsList = async (code) => {
  const res = await axios.get(STATS_URL.replace(':code', code));
  return _(res)
    .value()
}

const writeToSheet = async (teamCode, worksheet, workbook) => {
  const games = await gameList(teamCode)

  for (let i = 0; i < games.length; i++) {
    await games[i].init();
  }
  const rosterCodes = await rosterCodeList(teamCode);

  let rosters = []
  for (let i = 0; i < rosterCodes.length; i++) {
    let roster = new Roster(rosterCodes[i]);
    await roster.init()
    rosters.push(roster)
  }
  // let rosters = await Promise.all(rosterCodes.map(
  //   async code => {
  //     let roster = new Roster(code);
  //     await roster.init()
  //     return roster
  //   }
  // ))
  const gameIds = games.map((game) => { return game.gameId() })
  rosters = _(rosters).filter((roster) => {
    return roster.didParticipateInGames(gameIds)
  }).sortBy((roster) => {
    const mins = roster.mins(games[0].gameId())
    return !mins ? 0 : roster.mins(games[0].gameId())
  }).reverse()
    .values()

  try {
    const imageId = workbook.addImage({
      buffer: fs.readFileSync(logImagePath),
      extension: 'png',
    });
    worksheet.addImage(imageId, 'A1:A1');
  } catch {}

  //チーム名
  let row = worksheet.getRow(1)
  row.getCell(2).value = games[0].teamName()
  row.commit()
  //相手チーム

  games.forEach((game, n) => {
    let row = worksheet.getRow(4)
    let col = 8 + 3 * n
    row.getCell(col).value = game.dateTime().tz("Asia/Tokyo").format('MM/DD');
    row.getCell(col + 1).value = game.displayScore()
    row.commit()
    row = worksheet.getRow(5)
    row.getCell(col).value = game.oppTeamName()
    row.commit()
  })

  let rowNum = ROSTER_START_ROW;
  rosters.forEach((roster, i) => {
    let row = worksheet.getRow(i + ROSTER_START_ROW);
    row.getCell(1).value = roster.jerseyNo();
    row.getCell(2).value = roster.displayName();
    if (9 <= roster.displayName().length) {
      row.height = 34;
    }
    row.getCell(3).value = roster.position();
    row.getCell(4).value = roster.height();
    row.getCell(5).value = roster.weight();
    row.getCell(6).value = roster.age();
    row.getCell(7).value = roster.experienceYears();
    //各選手・試合ごとの情報
    games.forEach((game, n) => {
      let col = 8 + 3 * n
      //スコア
      let point = roster.points(game.gameId())
      //row.getCell(col).value = (point == null) ? '' : point
      point = (point == null) ? '' : point
      if (_.includes(game.starterRosterCodes(), roster.code)) {
        row.getCell(col).value = {
          'richText': [
            {'font': { underline: true, bold: true },'text': point},
          ]
        };
        //row.getCell(col).font = { underline: 'single' }
      } else {
        row.getCell(col).value = {
          'richText': [
            {'font': { bold: true },'text': point},
          ]
        };
      }
      // else {
      //   row.getCell(col).font = { underline: 'none' }
      // }
      // if (point && 3 <= point.lenght) {
      // }
      row.getCell(col + 1).value = roster.threePm(game.gameId());
      row.getCell(col + 2).value = roster.threePa(game.gameId());
    })
    row.commit();
  })
}

const main = async (teamCode1, teamCode2) => {
  const { app } = window.require('electron').remote

  await workbook.xlsx.readFile(path.join(__dirname, '../template.xlsx'))
    .then(async function () {
      await writeToSheet(teamCode1, workbook.getWorksheet('Sheet1'), workbook)
      await writeToSheet(teamCode2, workbook.getWorksheet('Sheet2'), workbook)

      const fileName = 'NBA_' + moment().format('YYYYMMDDHHmmss') + '.xlsx'
      const outputPath = path.join(app.getPath('desktop'), fileName)
      //console.log(app.getPath('desktop'));
      return workbook.xlsx.writeFile(outputPath);
    })
  await teamList()
  //   rosterCodes.map(asyn
}

//main(process.argv[2], process.argv[3]);
module.exports = {
  main, teamList
}

