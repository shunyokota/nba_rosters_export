
const { main, teamList } = require('./index.js')

// console.log(require('electron').remote)
// const {app} = window.require('electron').remote
// const path = require('path')

//html内の要素取得とリスナーの設定
document.querySelector("#execute").addEventListener('click', () => {
  convert();
})

//window.Vue = require('vue');
const mainVue = new Vue(
  {
    el: '#main',
    data: {
      teams: [],
      test: 'aa',
      selected_teams: []
    },
    created: function() {
      teamList().then((teams) => {
        this.teams = teams
      })
    }
  }
)


//openFileボタンが押されたとき（ファイル名取得まで）
function convert() {
  if (mainVue.selected_teams.length != 2) {
    console.log(mainVue)
    alert('チームを２つ選択してください。')
    return
  }

  main(mainVue.selected_teams[0], mainVue.selected_teams[1]).then(() => {
    alert('ファイルを出力しました。')
  }).catch((e) => {
    console.log(e)
    alert('エラーが発生しました。')
  })
  // const win = BrowserWindow.getFocusedWindow();
  // fetchHolidays().then(() => {
  //   return dialog.showOpenDialog(
  //     win,
  //     {
  //       properties: ['openFile'],
  //       filters: [
  //         {
  //           name: 'Document',
  //           extensions: ['csv', 'txt']
  //         }
  //       ]
  //     }
  //   )
  // }).then(result => {
  //   executeCsvConvert(result.filePaths[0]); //複数選択の可能性もあるので配列となる。
  // })
}
