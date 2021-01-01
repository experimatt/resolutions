import { useState, useEffect } from 'react'
import { loadAirtableData } from '../utils/airtable'

const AllResolutions = () => {
  const [resolutions, setResolutions] = useState([])
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const loadData = async () => {
      // load resolutions
      await loadAirtableData('2021', (results) => {
        setResolutions((resolutions) => [...resolutions, ...results])
      })
      // load players
      await loadAirtableData('Participants', (results) => {
        setPlayers((players) => [...players, ...results])
      })
    }

    loadData()
  }, [])

  let submitters = Object.fromEntries(players.map(person => [person.name, 0]))
  resolutions.forEach((record) => {
    submitters[record.submitter] = submitters[record.submitter] + 1 || 1
  })

  return (
    <div>
      <main>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column wrap'}}>
          <h1 style={{textAlign: 'center', margin: '0', padding: '1em 1em 0.25em' }}>Resolutions Game</h1>
          <div style={{textAlign: 'center', fontSize: '0.9em', fontStyle: 'italic', color: 'gray', paddingBottom: '1em'}}>
            Strauss family new years, Jan 1, 2021
          </div>
          <h2 style={{textAlign: 'center', margin: '0', padding: '0.5em' }}>Submissions by person</h2>
          <ul style={{lineHeight: '2em'}}>
            {Object.entries(submitters).map(([person, count], i) => {
              return <li key={i}><span style={{fontWeight: 500, color: 'gray'}}>{person}</span>: {count}</li>
            })}
          </ul>
          <h2 style={{textAlign: 'center', margin: '0', padding: '0.5em' }}>All resolutions ({resolutions.length})</h2>
          <ol style={{lineHeight: '2em', paddingBottom: '2em'}}>
            {resolutions.map((submission) => {
              return <li key={submission.id}>{submission.resolution}</li>
            })}
          </ol>
        </div>
      </main>
    </div>
  )
}

export default AllResolutions
