import { useState, useEffect } from 'react'
import Airtable from 'airtable'
import _shuffle from 'lodash/shuffle'
import _findIndex from 'lodash/findIndex'

const Home = () => {
  const [resolutions, setResolutions] = useState([])
  const [players, setPlayers] = useState([])
  const [gameInProgress, setGameInProgress] = useState(false)

  const gameDefaults = {players: [], resolutions: [], currentPlayer: null}
  const [activeGame, setActiveGame] = useState(gameDefaults)

  useEffect(() => {
    const base = new Airtable({apiKey: process.env.REACT_APP_AIRTABLE_API_KEY}).base('appZoPqIzmHPJRrvY');

    const loadAirtableData = async (tableName, onSuccess) => {
      await base(tableName).select({
        pageSize: 100,
        maxRecords: 100,
        view: 'Grid view'
      }).eachPage((records, fetchNextPage) => {
        const results = records.map((record) => {
          return {
            id: record.id,
            ...record.fields
          }
        })
        fetchNextPage()
        onSuccess(results)
      }, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
    }

    const loadData = async () => {
      // load resolutions
      await loadAirtableData('2021', setResolutions)

      // load players
      await loadAirtableData('Participants', setPlayers)
    }

    loadData()
  }, [])

  const handleStartGame = (e) => {
    e.preventDefault()
    setGameInProgress(true)
    const shuffledPlayers = _shuffle(players)
    setActiveGame({
      players: shuffledPlayers,
      currentPlayer: shuffledPlayers[0],
      resolutions: _shuffle(resolutions),
    })
  }

  const handleStopGame = (e) => {
    e.preventDefault()
    setGameInProgress(false)
    setActiveGame(gameDefaults)
  }

  const currentPlayerIndex = gameInProgress ? _findIndex(activeGame?.players, {id: activeGame?.currentPlayer.id}) : null

  const nextPlayerIndex = currentPlayerIndex +1 >= activeGame?.players?.length ? 0 : currentPlayerIndex + 1

  const getFirstName = (player) => { return player?.name.split(' ')[0] }

  const nextResolutionButtonText = `${activeGame.resolutions.length === 2 ? 'Last one!' : 'Next resolution'} (${getFirstName(activeGame?.players[nextPlayerIndex])})`

  const nextResolution = (e) => {
    e.preventDefault()
    const { players, resolutions } = activeGame
    var nextResolutions = resolutions.slice(1)

    // next player
    // const nextPlayerId = players[nextPlayerIndex].id

    // next resolution
    // if (nextResolutions[0].participant[0] === nextPlayerId) {
    //   nextResolutions.push(nextResolutions.shift())
    // }

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
                Game started with {activeGame.players?.length} players and{' '}
                {resolutions?.length} resolutions.{' '}
                {activeGame.resolutions?.length} resolutions remain.
              </div>
              <div
                style={{border: 'solid 1px #3B82F6', width: '640px', padding: '2em 4em', margin: '0.5em', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column wrap'}}
              >
                <div
                  style={{textAlign: 'left', padding: '0.5em', fontWeight: '600', lineHeight: '2em'}}
                >
                  <div
                    style={{color: '#1F2937', fontSize: '1.4em', marginRight: '0.5em', fontWeight: '600', padding: '0.5em 0' }}
                  >
                    {`${getFirstName(activeGame?.currentPlayer)} resolves to...`}
                  </div>
                  <div
                    style={{color: '#1D4ED8', fontSize: '1.8em', padding: '0.5em 0'}}
                  >
                    {activeGame.resolutions[0].resolution.replace('I resolve to ','')}
                  </div>
                </div>
                <div style={{padding: '1em'}}>
                  <button
                    onClick={nextResolution}
                    style={{fontSize: '1.2em', fontWeight: 700, padding: '0.5em 1em', cursor: 'pointer', color: '#4B5563'}}
                    disabled={activeGame.resolutions.length === 1}
                  >
                    {nextResolutionButtonText}
                  </button>
                </div>
              </div>
              <h2 style={{textAlign: 'center', margin: 0, padding: '0.5em' }}>Player order</h2>
              <ol style={{lineHeight: '2em', margin: 0}}>
                { activeGame.players.map((person) => {
                  return <li key={person.id} style={{fontWeight: 500, color: activeGame.currentPlayer?.id === person.id ? 'black' : 'gray'}}>{person.name}</li>
                })}
              </ol>
              <div style={{padding: '2em 1em'}}>
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
