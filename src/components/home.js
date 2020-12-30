import { useState, useEffect } from 'react'
import Airtable from 'airtable'
import _shuffle from 'lodash/shuffle'
import _findIndex from 'lodash/findIndex'

const Home = () => {
  const [resolutions, setResolutions] = useState([])
  const [players, setPlayers] = useState([])
  const [gameInProgress, setGameInProgress] = useState(false)

  const gameDefaults = {players: [], resolutions: [], usedResolutions: [], currentPlayer: null}
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
      drawnResolutions: []
    })
  }

  const handleStopGame = (e) => {
    e.preventDefault()
    setGameInProgress(false)
    setActiveGame(gameDefaults)
  }

  if (gameInProgress) {
    console.log('activeGame',activeGame)
  }

  const nextResolution = (e) => {
    e.preventDefault()
    const { players, currentPlayer, resolutions } = activeGame
    var nextResolutions = resolutions.slice(1)

    // next player
    const numPlayers = players.length
    const currentPlayerIndex = _findIndex(players, {id: currentPlayer.id})
    const nextPlayerIndex = currentPlayerIndex === numPlayers ? 0 : currentPlayerIndex + 1
    // const nextPlayerId = players[nextPlayerIndex].id

    // next resolution
    // if (nextResolutions[0].participant[0] === nextPlayerId) {
    //   nextResolutions.push(nextResolutions.shift())
    // }

    setActiveGame({
      currentPlayer: players[nextPlayerIndex],
      resolutions: nextResolutions,
      players: players
    })
  }

  return (
    <div>
      <main>
        <h1 style={{textAlign: 'center', margin: '0', padding: '1em 1em 0.25em' }}>Resolutions Game</h1>
        <div style={{textAlign: 'center', fontSize: '0.9em', fontStyle: 'italic', color: 'gray'}}>
          Strauss family new years, Jan 1, 2021
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column wrap'}}>
          <div style={{padding: '1em'}}>The game is {gameInProgress ? 'currently' : 'not currently'} in progress.</div>
            {
              gameInProgress ? (
              <>
                <div style={{padding: '1em'}}>
                  {activeGame.players?.length} players; {activeGame.resolutions?.length} total resolutions; {activeGame.drawnResolutions?.length} resolutions drawn;
                </div>
                <div style={{border: 'solid 1px blue', width: '640px', padding: '1em', margin: '1em', backgroundColor: '#F3F4F6'}}>
                  <div style={{textAlign: 'center', padding: '0.5em', color: '#4B5563', fontWeight: '600'}}>
                    {activeGame.currentPlayer.name}
                  </div>
                  <h2>
                    {activeGame.resolutions[0].resolution}
                  </h2>
                  <div style={{padding: '1em'}}>
                    <button onClick={nextResolution} style={{fontSize: '1.2em', fontWeight: 700, padding: '0.5em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      Next resolution
                    </button>
                  </div>
                </div>
                <h2 style={{textAlign: 'center', margin: '0', padding: '0.5em' }}>Player order</h2>
                <ol style={{lineHeight: '2em'}}>
                  { activeGame.players.map((person) => {
                    return <li key={person.id} style={{fontWeight: 500, color: activeGame.currentPlayer?.id === person.id ? 'black' : 'gray'}}>{person.name}</li>
                  })}
                </ol>
                <div style={{padding: '1em'}}>
                  <button onClick={handleStopGame} style={{fontSize: '1.5em', fontWeight: 700, padding: '0.5em', cursor: 'pointer'}}>
                    Stop game!
                  </button>
                </div>
              </>
            ) : (
              <div style={{padding: '1em'}}>
                <button onClick={handleStartGame} style={{fontSize: '1.8em', fontWeight: 700, padding: '0.5em', cursor: 'pointer'}}>
                  Start game!
                </button>
              </div>
            )
          }
        </div>
      </main>
    </div>
  )
}

export default Home
