import { useState, useEffect } from 'react'
import Airtable from 'airtable'

const App = () => {
  const [resolutions, setResolutions] = useState([])

  useEffect(() => {
    const base = new Airtable({apiKey: process.env.REACT_APP_AIRTABLE_API_KEY}).base('appZoPqIzmHPJRrvY');

    base('2021').select({
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
      setResolutions(results)
      fetchNextPage()
    }, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  }, [])

  let submitters = {}
  resolutions.forEach((record) => {
    submitters[record.submitter] = submitters[record.submitter] + 1 || 1
  })

  return (
    <div>
      <main>
        <h1 style={{textAlign: 'center', margin: '0', padding: '1em 1em 0.25em' }}>Resolutions Game</h1>
        <div style={{textAlign: 'center', fontSize: '0.9em', fontStyle: 'italic', color: 'gray', paddingBottom: '1em'}}>
          Strauss family new years, Jan 1, 2021
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column wrap'}}>
          <h2 style={{textAlign: 'center', margin: '0', padding: '0.5em' }}>Submitters</h2>
          <ul style={{lineHeight: '2em'}}>
            {Object.entries(submitters).map(([person, count], i) => {
              return <li key={i}><span style={{fontWeight: 500, color: 'gray'}}>{person}</span>: {count}</li>
            })}
          </ul>
          <h2 style={{textAlign: 'center', margin: '0', padding: '0.5em' }}>Resolutions</h2>
          <ul style={{lineHeight: '2em'}}>
            {resolutions.map((submission) => {
              return <li key={submission.id}>{submission.resolution}</li>
            })}
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
