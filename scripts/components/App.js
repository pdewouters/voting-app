import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import Rebase from 're-base';
import autobind from 'autobind-decorator';
const base = Rebase.createClass('https://paulwp-polls-fcc.firebaseio.com');

import Header from './Header.js';
import PollList from './PollList.js';
import AddPollForm from './AddPollForm.js';
import PollDetails from './PollDetails.js';

@autobind
class App extends React.Component {
    componentDidMount() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() =>
            this.forceUpdate()
        );

        this.pollsRef = base.listenTo('paulwp/polls', {
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
        this.choicesRef = base.listenTo('paulwp/choices', {
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
    }

    componentWillUnmount() {
        this.unsubscribe();
        base.removeBinding(this.pollsRef);
        base.removeBinding(this.choicesRef);
    }

    addPoll(poll){
        const { store } = this.context;
        const state = store.getState();
        store.dispatch({
            type: 'ADD_POLL',
            id: poll.id,
            desc: poll.desc
        });

        base.post('paulwp/polls/' + poll.id, {
            data: {desc: poll.desc},
        });
    }

    addChoice(choice){
        const { store } = this.context;
        const state = store.getState();
        store.dispatch({
            type: 'ADD_CHOICE',
            id: choice.id,
            desc: choice.desc,
            pollID: choice.pollID,
            voteTally: choice.voteTally
        });
        base.post('paulwp/choices/' + choice.id, {
            data: {desc: choice.desc, pollID: choice.pollID, voteTally: choice.voteTally},

        });
    }

    loadPollDetails(pollID){
        const { store } = this.context;
        const state = store.getState();
        store.dispatch({
            type: 'SET_CURRENT_POLL',
            pollID
        });
    }

    render(){
        var details;
        const { store } = this.context;
        const state = store.getState();
        if(state.polls.length>=1){
            var pollID = state.currentPoll || state.polls[0];
            var poll = _.findWhere(state.polls,{id:pollID}) || {};
            var choices = _.where(state.choices,{pollID:pollID}) || [];
            details = <PollDetails loadPollDetails={this.loadPollDetails} currentPoll={state.currentPoll} addChoice={this.addChoice} pollDetails={poll} choices={choices} />;
        } else {
            details = '';
        }
        return (
            <div>
                <Header />
                <PollList polls={state.polls} loadPollDetails={this.loadPollDetails} />
                <AddPollForm loadPollDetails={this.loadPollDetails} currentPoll={state.currentPoll} addPoll={this.addPoll} />
                {details}
            </div>
        );
    }
}

App.contextTypes = {
    store: React.PropTypes.object
};

module.exports = connect(state => (state), {})(App);
