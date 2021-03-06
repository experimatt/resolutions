import { Router, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import Home from './home'
import AllResolutions from './all-resolutions'
import Submissions from './submissions'
import '../styles/index.css'

var history = createBrowserHistory()

const App = () => {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/all' component={AllResolutions} />
        <Route path='/submissions' component={Submissions} />
      </Switch>
    </Router>
  )
}

export default App
