import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouter from 'react-router';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router';
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';


// Components
import NotFound from './components/NotFound';
import VoteOnPoll from './components/VoteOnPoll';
import PollResults from './components/PollResults';
import App from './components/App';
import reducers from './reducers';
const store = createStore(reducers);
const history = createBrowserHistory();
syncReduxAndRouter(history, store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App} />
            <Route path="public/polls/:pollID" component={VoteOnPoll} />
            <Route path="public/polls/results/:pollID" component={PollResults} />
            <Route path="*" component={NotFound} />
        </Router>
    </Provider>,
    document.getElementById('main')
);
