const axios = require('axios');
const _ = require('lodash');
const fs = require('fs')
const TEAM_LIST_URL = 'https://jp.global.nba.com/stats2/league/conferenceteamlist.json?locale=ja';
const ROSTERS_URL = 'https://jp.global.nba.com/stats2/team/roster.json?locale=ja&teamCode=:code'
const SCHEDULE_URL = 'https://jp.global.nba.com/stats2/team/schedule.json?countryCode=JP&locale=ja&teamCode=:code'
const STATS_URL = 'https://jp.global.nba.com/stats2/player/stats.json?ds=profile&locale=ja&playerCode=:code'
const {Roster} = require('./Roster')
const {Game} = require('./Game')
const ROSTER_START_ROW = 6

var Excel = require('exceljs');
var workbook = new Excel.Workbook();

const HISTORY_LEN = 5;
const teamCode1 = process.argv[2];
const teamCode2 = process.argv[3];

const getLogoImagePath = (abbr) => {
  return `./img/logo/${abbr}_logo.png`
}
const teamList = async () => {
  const res = await axios.get(TEAM_LIST_URL);
  console.log(_(res.data.payload.listGroups).flatMap('teams').map('profile').map('abbr').value());
}

const rosterCodeList = async (code) => {
  const res = await axios.get(ROSTERS_URL.replace(':code', code));
  return _(res.data.payload.players).map('profile').map('code').value();
}
let logImagePath = ''
const gameList = async (code) => {
  const res = await axios.get(SCHEDULE_URL.replace(':code', code));
  logImagePath = getLogoImagePath(res.data.payload.profile.abbr)
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
    .map((game) => {
      return new Game(game)
    })
    .value()
}

const statsList = async (code) => {
  const res = await axios.get(STATS_URL.replace(':code', code));
  console.log(res.data.payload);
  return _(res)
    .value()
}

const writeToSheet = async (teamCode, worksheet, workbook) => {
  const games = await gameList(teamCode)

  const rosterCodes = await rosterCodeList(teamCode);

  let rosters = await Promise.all(rosterCodes.map(
    async code => {
      let roster = new Roster(code);
      await roster.init()
      return roster
    }
  ))
  rosters = _(rosters).sortBy((roster) => {
    const mins = roster.mins(games[0].gameId())
    return !mins ? 0 : roster.mins(games[0].gameId())
  }).reverse()
    .values()

  const imageId = workbook.addImage({
    buffer: fs.readFileSync(logImagePath),
    extension: 'png',
  });
  worksheet.addImage(imageId, 'A1:B2');

  //チーム名
  let row = worksheet.getRow(1)
  row.getCell(3).value = games[0].teamName()
  row.commit()
  //相手チーム

  games.forEach((game, n) => {
    let row = worksheet.getRow(4)
    let col = 9 + 3 * n
    row.getCell(col).value = game.displayScore()
    row.commit()
    row = worksheet.getRow(5)
    row.getCell(col).value = game.oppTeamName()
    row.commit()
  })

  let rowNum = ROSTER_START_ROW;
  let strongStyle = wb.createStyle({
    font: {
      bold: true,
      underline: true,
    },
  });
  rosters.forEach((roster, i) => {
    let row = worksheet.getRow(i + ROSTER_START_ROW);
    row.getCell(2).value = roster.jerseyNo();
    row.getCell(3).value = roster.displayName();
    row.getCell(3).style =
    row.getCell(4).value = roster.position();
    row.getCell(5).value = roster.height();
    row.getCell(6).value = roster.weight();
    row.getCell(7).value = roster.dayOfBirth().format('YYYY/MM/DD');
    row.getCell(8).value = roster.experienceYears();
    //各選手・試合ごとの情報
    games.forEach((game, n) => {
      let col = 9 + 3 * n
      //スコア
      row.getCell(col).value = roster.points(game.gameId());
      row.getCell(col + 1).value = roster.threePa(game.gameId());
      row.getCell(col + 2).value = roster.threePm(game.gameId());
    })
    row.commit();
  })
}

const main = async () => {

  await workbook.xlsx.readFile('template.xlsx')
    .then(async function () {
      await writeToSheet(teamCode1, workbook.getWorksheet(1), workbook)
      await writeToSheet(teamCode2, workbook.getWorksheet(2), workbook)

      return workbook.xlsx.writeFile('new.xlsx');
    })
  await teamList()
  //   rosterCodes.map(asyn
}

main();

