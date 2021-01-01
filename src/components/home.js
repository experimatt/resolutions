import { useState, useEffect } from 'react'
import { loadAirtableData } from '../utils/airtable'
import _shuffle from 'lodash/shuffle'
import _findIndex from 'lodash/findIndex'
import _find from 'lodash/find'
import _uniq from 'lodash/uniq'

const Home = () => {
  const [resolutions, setResolutions] = useState([])
  const [players, setPlayers] = useState([])
  const [gameInProgress, setGameInProgress] = useState(false)

  const gameDefaults = {players: [], resolutions: [], currentPlayer: null}
  const [activeGame, setActiveGame] = useState(gameDefaults)
  const [gameResults, setGameResults] = useState({})

  // load game & results from local storage
  useEffect(() => {
    const active = localStorage.getItem('activeGame')
    const results = localStorage.getItem('gameResults')

    if (active && results) {
      setActiveGame(JSON.parse(active))
      setGameResults(JSON.parse(results))
      setGameInProgress(true)
    }
  }, [])

  // load resolutions and players from airtable
  useEffect(() => {
    const loadData = async () => {
      await loadAirtableData('2021', (results) => {
        setResolutions((resolutions) => [...resolutions, ...results])
      })
      await loadAirtableData('Participants', (results) => {
        setPlayers((players) => [...players, ...results])
      })
    }

    loadData()
  }, [])

  // keep track of game results
  useEffect(() => {
    const { currentPlayer, resolutions } = activeGame

    if (currentPlayer) {
      const currentPlayerResults = gameResults[currentPlayer.name] || []
      setGameResults({
        ...gameResults,
        [currentPlayer.name]: _uniq([resolutions[0].resolution, ...currentPlayerResults])
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame.currentPlayer])

  // save activeGame & results to local storage
  useEffect(() => {
    if (gameInProgress) {
      localStorage.setItem('activeGame', JSON.stringify(activeGame))
      localStorage.setItem('gameResults', JSON.stringify(gameResults))
    }
  }, [activeGame, gameResults, gameInProgress])

  const handleStartGame = (e) => {
    e.preventDefault()
    setGameInProgress(true)
    const shuffledPlayers = _shuffle(players.filter(p => p.playing))
    setGameResults(Object.fromEntries(shuffledPlayers.map(player => [player.name, []])))
    setActiveGame({
      players: shuffledPlayers,
      currentPlayer: shuffledPlayers[0],
      resolutions: _shuffle(resolutions)
    })
  }

  const handleStopGame = (e) => {
    e.preventDefault()
    var confirmed = window.confirm('Are you sure you want to stop the game? This will clear the game & results from local storage')
    if (confirmed) {
      localStorage.removeItem('activeGame')
      localStorage.removeItem('gameResults')
      setGameInProgress(false)
      setActiveGame(gameDefaults)
    }
  }

  const handleExportResults = () => {
    let downloadElement = document.createElement('a')
    let dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(JSON.stringify(gameResults, null, 2))
    downloadElement.setAttribute('href', dataUri)
    downloadElement.setAttribute('download', 'gameResults.txt')
    downloadElement.click()
  }

  const currentTurnPlayerIndex = gameInProgress ? _findIndex(activeGame?.players, {id: activeGame?.currentPlayer.id}) : null
  const getNextPlayerIndex = (currentIndex = currentTurnPlayerIndex) => {
    return currentIndex +1 >= activeGame?.players?.length ? 0 : currentIndex + 1
  }

  const getFirstName = (player) => { return player?.name.split(' ')[0] }
  const nextResolutionButtonText = `${activeGame.resolutions.length === 2 ? 'Last one!' : 'Next resolution'} (${getFirstName(activeGame?.players[getNextPlayerIndex()])})`

  const nextResolution = (e) => {
    e.preventDefault()
    const { players, resolutions } = activeGame
    var nextResolutions = resolutions.slice(1)

    // next player
    let nextPlayerIndex = getNextPlayerIndex()
    const nextPlayerId = players[nextPlayerIndex].id

    console.log('--------')
    console.log(`${getFirstName(activeGame.currentPlayer)} => ${getFirstName(activeGame.players[nextPlayerIndex])}; Submitter: ${nextResolutions[0].submitter.split(' ')[0]}`)

    // make sure next resolution isn't written by next player
    const otherPlayerResolution = _find(nextResolutions, (r) => { return r.participant[0] !== nextPlayerId})
    if (otherPlayerResolution) {
      while(nextResolutions[0].participant[0] === nextPlayerId) {
        console.log('Skipping resolutions submitted by',nextResolutions[0].submitter.split(' ')[0])
        nextResolutions.push(nextResolutions.shift())
      }
    } else {
      alert(`There are no more resolutions available for ${getFirstName(players[nextPlayerIndex])}. Skipping them.`)
      nextPlayerIndex = getNextPlayerIndex(nextPlayerIndex)
    }

    if (nextResolutions.length) {
      setActiveGame({
        currentPlayer: players[nextPlayerIndex],
        resolutions: nextResolutions,
        players: players
      })
    } else{
      setActiveGame(gameDefaults)
    }
  }

  return (
    <div>
      <main>
        <h1 style={{textAlign: 'center', margin: 0, padding: '1em 1em 0.25em' }}>Resolutions Game</h1>
        <div style={{textAlign: 'center', fontSize: '0.9em', fontStyle: 'italic', color: 'gray'}}>
          Strauss family new years, Jan 1, 2021
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column wrap'}}>
          {
            gameInProgress ? (
            <>
              <div style={{padding: '1em'}}>
                Game in progress with {activeGame.players?.length} players and{' '}
                {resolutions?.length} resolutions.{' '}
                {activeGame.resolutions?.length - 1} resolutions remain.
              </div>
              <div
                style={{border: 'solid 1px #3B82F6', width: '640px', padding: '2em 4em', margin: '2em 0', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column wrap'}}
              >
                <div style={{textAlign: 'left', padding: '0.5em', fontWeight: '600', lineHeight: '2em', width: '100%'}}>
                  <div
                    style={{color: '#1F2937', fontSize: '1.4em', marginRight: '0.5em', fontWeight: '600', padding: '0.5em 0' }}
                  >
                    {`${getFirstName(activeGame?.currentPlayer)} resolves to...`}
                  </div>
                  <div
                    style={{color: '#1D4ED8', fontSize: '1.8em', padding: '0.5em 0', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    {activeGame.resolutions[0].resolution.replace('I resolve to ','')}
                  </div>
                </div>
                <div style={{padding: '1em'}}>
                  <button
                    onClick={nextResolution}
                    style={{fontSize: '1.2em', fontWeight: 700, padding: '0.5em 1em', minWidth: '300px', cursor: activeGame.resolutions.length <= 1 ? 'not-allowed' : 'pointer', color: '#4B5563'}}
                    disabled={activeGame.resolutions.length <= 1}
                  >
                    {activeGame.resolutions.length <= 1 ? 'Game over!': nextResolutionButtonText}
                  </button>
                </div>
              </div>
              <h2 style={{textAlign: 'center', margin: 0, padding: '0.5em' }}>Player order</h2>
              <ol style={{lineHeight: '2em', margin: 0, paddingBottom: '1em'}}>
                { activeGame.players.map((person) => {
                  return <li key={person.id} style={{fontWeight: 500, color: activeGame.currentPlayer?.id === person.id ? 'black' : 'gray'}}>{person.name}</li>
                })}
              </ol>
              <h2 style={{textAlign: 'center', margin: 0, padding: '0.5em' }}>Results</h2>
              <ul style={{lineHeight: '2em', width: '640px', margin: 0}}>
                {Object.entries(gameResults).map(([name, resolutions], i) => {
                  return (
                    <li key={i} style={{fontWeight: 600}}>
                      {name}
                      <ul style={{fontWeight: 500, color: 'gray'}}>
                        {resolutions.map((resolution, i) => {
                          return <li key={i} style={{fontWeight: 400, color: 'gray'}}>{resolution}</li>
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
              <div style={{padding: '2em 1em'}}>
                <button id='saveResults' onClick={handleExportResults} style={{fontSize: '1.5em', fontWeight: 700, padding: '0.5em 1em', cursor: 'pointer', marginRight: '1em' }}>
                  Export results
                </button>
                <button onClick={handleStopGame} style={{fontSize: '1.5em', fontWeight: 700, padding: '0.5em 1em', cursor: 'pointer'}}>
                  Stop game!
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{padding: '1em'}}>
                There is no game in progress.
              </div>
              <div style={{padding: '1em'}}>
                <button onClick={handleStartGame} style={{fontSize: '1.8em', fontWeight: 700, padding: '0.5em 1em', cursor: 'pointer'}}>
                  Start game!
                </button>
              </div>
            </>
          )
        }
        </div>
      </main>
    </div>
  )
}

export default Home
