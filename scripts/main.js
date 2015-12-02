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
        case 'LOAD_POLL':

            if(_.findWhere(state,{id:action.poll.key})){
                return state;
            } else {
                return [
                    ...state,
                    {
                        id: action.poll.key,
                        desc: action.poll.desc,
                    }
                ];
            }

        case 'ADD_POLL':
            return [
                ...state,
                {
                    id: action.id,
                    desc: action.desc
                }
            ];
        default:
            return state;
    }
};

const choices = (state = [], action) => {
    switch(action.type){
        case 'LOAD_CHOICE':
            if(_.findWhere(state,{id:action.choice.key})){
                return state;
            } else {
                return [
                    ...state,
                    {
                        id: action.choice.key,
                        desc: action.choice.desc,
                        pollID: action.choice.pollID
                    }
                ];
            }
        case 'ADD_CHOICE':
            return [
                ...state,
                {
                    id: action.id,
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

        base.listenTo('paulwp/polls', {
            context: this,
            asArray: true,
            then(pollsData){
                pollsData.map(function(poll){
                    store.dispatch({
                        type: 'LOAD_POLL',
                        poll: poll
                    })
                })

            }
        })
        base.listenTo('paulwp/choices', {
            context: this,
            asArray: true,
            then(choicesData){
                choicesData.map(function(choice){
                    store.dispatch({
                        type: 'LOAD_CHOICE',
                        choice: choice
                    })
                })

            }
        })
    },

    componentWillUnmount: function() {
        this.unsubscribe();
    },

    addPoll: function(poll){

        store.dispatch({
            type: 'ADD_POLL',
            id: poll.id,
            desc: poll.desc
        });

        base.post('paulwp/polls/' + poll.id, {
            data: {desc: poll.desc},

        });
    },
    addChoice: function(choice){

        store.dispatch({
            type: 'ADD_CHOICE',
            id: choice.id,
            desc: choice.desc,
            pollID: choice.pollID
        });
        base.post('paulwp/choices/' + choice.id, {
            data: {desc: choice.desc, pollID: choice.pollID},

        });
    },
    loadPollDetails: function(pollID){
        store.dispatch({
            type: 'SET_CURRENT_POLL',
            pollID
        });
    },
    render: function(){
        var details;
        const { store } = this.context;
        const state = store.getState();
        if(state.polls.length>=1){
            var pollID = state.currentPoll || state.polls[0];
            var poll = _.findWhere(state.polls,{id:pollID});
            var choices = _.where(state.choices,{pollID:pollID});console.log(state.choices);
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
    renderPoll: function(poll,index){
        return <li index={index} key={index}>
            <a onClick={this.handleClick} data-id={poll.id} href="#">{poll.desc}</a> - <Link to={`/public/polls/${poll.id}`}>Vote</Link>
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
    renderChoice: function(choice,index){
        return <li index={index} key={index}>
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
            pollID: this.props.currentPoll,
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

const VoteOnPoll = React.createClass({
    componentDidMount: function() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() =>
            this.forceUpdate()
        );
    },

    componentWillUnmount: function() {
        this.unsubscribe();
    },
    render: function(){
        const { store } = this.context;
        var state = store.getState();
        var poll = _.findWhere(state.polls,{id:this.props.params.pollID});
        var choices = _.where(state.choices,{pollID:this.props.params.pollID});
        return (
            <div>
                <ul>
                    {choices.map(function(choice){
                        return <li key={choice.id}>{choice.desc}</li>
                    })}
                </ul>
            </div>
        );
    }
});
VoteOnPoll.contextTypes = {
    store: React.PropTypes.object
};

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
            <Route path="/" component={App} />
            <Route path="public/polls/:pollID" component={VoteOnPoll} />
        </Router>
    </Provider>,
    document.getElementById('main')
);
