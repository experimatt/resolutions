import Airtable from 'airtable'

export const base = new Airtable({apiKey: process.env.REACT_APP_AIRTABLE_API_KEY}).base('appZoPqIzmHPJRrvY');

export const loadAirtableData = async (tableName, onSuccess) => {
  await base(tableName).select({
    pageSize: 100,
    maxRecords: 1000,
    view: 'Grid view'
  }).eachPage( async(records, fetchNextPage) => {
    const results = records.map((record) => {
      return {
        id: record.id,
        ...record.fields
      }
    })
    await onSuccess(results)
    fetchNextPage()
  }, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}
