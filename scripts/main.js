const React = require('react');
const ReactDOM = require('react-dom');
const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const Navigation = ReactRouter.Navigation;
import createBrowserHistory from 'history/lib/createBrowserHistory';
const history = createBrowserHistory();
const h = require('./helpers');
const Link = require('react-router').Link;
const Rebase = require('re-base');
const base = Rebase.createClass('https://paulwp-polls-fcc.firebaseio.com');
const _ = require('underscore');
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router';
const Redux = require('redux');
import { connect } from 'react-redux'
const createStore = Redux.createStore;
const combineReducers = Redux.combineReducers;
import { Provider } from 'react-redux';

const polls = (state = [], action) => {
    switch(action.type){
        case 'ADD_POLL':
            var timestamp = (new Date()).getTime();
            return [
                ...state,
                {
                    id: 'poll-' + timestamp,
                    desc: action.desc
                }
            ];
        default:
            return state;
    }
};

const choices = (state = [], action) => {
    switch(action.type){
        case 'ADD_CHOICE':
            var timestamp = (new Date()).getTime();
            return [
                ...state,
                {
                    id: 'choice-' + timestamp,
                    desc: action.desc,
                    pollID: action.pollID
                }
            ];
        default:
            return state;
    }
};

const currentPoll = (state = [], action) => {
    switch(action.type){
        case 'SET_CURRENT_POLL':
            return action.pollID;
        default:
            return state;
    }
};

const votingApp = combineReducers({
   polls,
    choices,
    currentPoll,
    routing: routeReducer
});
const store = createStore(votingApp);

const App = React.createClass({
    componentDidMount: function() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() =>
            this.forceUpdate()
        );
    },

    componentWillUnmount: function() {
        this.unsubscribe();
    },
    getInitialState: function(){
      return {
          polls: [],
          choices: [],
          currentPoll: ''
    };
    },
    addPoll: function(poll){
        //this.state.polls.push(poll);
        //this.setState({polls: this.state.polls});
        store.dispatch({
            type: 'ADD_POLL',
            desc: poll.desc
        });
        console.log(store.getState());
    },
    addChoice: function(choice){
        //this.state.choices.push(choice);
        //this.setState({choices: this.state.choices});
        store.dispatch({
            type: 'ADD_CHOICE',
            desc: choice.desc,
            pollID: choice.pollID
        });
        console.log(store.getState());
    },
    loadPollDetails: function(pollID){
        //this.setState({currentPoll: pollID});
        store.dispatch({
            type: 'SET_CURRENT_POLL',
            pollID
        });
        console.log(store.getState());
    },
    render: function(){
        var details;
        const { store } = this.context;
        const state = store.getState();
        if(state.polls.length>=1){
            var pollID = state.currentPoll || state.polls[0];
            var poll = _.findWhere(state.polls,{id:pollID});
            var choices = _.where(state.choices,{pollID:pollID});
            details = <PollDetails loadPollDetails={this.loadPollDetails} currentPoll={state.currentPoll} addChoice={this.addChoice} pollDetails={poll} choices={choices} />;
        } else {
            details = '';
        }
        return (
            <div>
                <div className="page-header">
                    <h1><Link to="/">My Polls</Link></h1>
                </div>
                <PollList polls={state.polls} loadPollDetails={this.loadPollDetails} />
                <AddPollForm loadPollDetails={this.loadPollDetails} currentPoll={state.currentPoll} addPoll={this.addPoll} />
                {details}
            </div>
        );
    }
});
App.contextTypes = {
    store: React.PropTypes.object
};

const PollList = React.createClass({
    handleClick: function(e){
        e.preventDefault();
        // load poll details into component
        var pollID = e.target.getAttribute('data-id');
        this.props.loadPollDetails(pollID);
    },
    renderPoll: function(poll){
        return <li index={poll.id} key={poll.id}>
            <a onClick={this.handleClick} data-id={poll.id} href="#">{poll.desc}</a>
        </li>
    },
    render: function(){
        return (
            <ul>
                {this.props.polls.map(this.renderPoll)}
            </ul>
        );
    }
});

const AddPollForm = React.createClass({
    handleSubmit: function(e){
        e.preventDefault();
        var timestamp = (new Date()).getTime();
        var poll = {
            id: 'poll-' + timestamp,
            desc: this.refs.pollName.value
        };
        this.props.addPoll(poll);
        this.props.loadPollDetails(poll.id);
        this.refs.pollName.value = '';
    },
    render: function(){
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add Poll</label>
                <input ref="pollName" type="text" />
                <input type="submit" />
            </form>
        );
    }
});

const PollDetails = React.createClass({
    renderChoice: function(choice){
        return <li index={choice.id} key={choice.id}>
            {choice.desc}
        </li>
    },
    render: function(){

        return (
            <div>
                <h2>{this.props.pollDetails? this.props.pollDetails.desc : ''}</h2>
                <AddChoiceForm loadPollDetails={this.props.loadPollDetails} currentPoll={this.props.currentPoll} addChoice={this.props.addChoice} />

                <ul>
                    {this.props.choices.map(this.renderChoice)}
                </ul>
            </div>
        );
    }
});

const AddChoiceForm = React.createClass({
    handleSubmit: function(e){
        e.preventDefault();
        var timestamp = (new Date()).getTime();
        var choice = {
            id: 'choice-' + timestamp,
            desc: this.refs.choiceText.value,
            pollID: this.props.currentPoll
        };
        this.props.addChoice(choice);
        this.props.loadPollDetails(this.props.currentPoll);
        this.refs.choiceText.value = '';
    },
    render: function(){
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add Choice</label>
                <input ref="choiceText" type="text" />
                <input type="submit" />
            </form>
        );
    }
});

const NotFound = React.createClass({
    render: function(){
        return (
            <h1>Not found</h1>
        );
    }
});

syncReduxAndRouter(history, store)

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={App}>
                <Route path="polls/:pollID" component={PollDetails} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('main')
);
