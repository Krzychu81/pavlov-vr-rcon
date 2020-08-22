const sortPlayersByNick = players =>
  players.sort((a, b) => a.nick.localeCompare(b.nick, 'en', {ignorePunctuation: true}))


export {
  sortPlayersByNick,
}