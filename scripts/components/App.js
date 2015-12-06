import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import Rebase from 're-base';
import autobind from 'autobind-decorator';
const base = Rebase.createClass('https://paulwp-polls-fcc.firebaseio.com');
import Firebase from 'firebase';
var ref = new Firebase("https://paulwp-polls-fcc.firebaseio.com");

import Header from './Header.js';
import PollList from './PollList.js';
import AddPollForm from './AddPollForm.js';
import PollDetails from './PollDetails.js';

@autobind
class App extends React.Component {
    authenticate(provider) {
        ref.authWithOAuthPopup(provider, this.authHandler);
    }
    componentDidMount() {
        const { store } = this.context;
        var state = store.getState();
        var authData = ref.getAuth();

        if(authData) {

            // update our state to reflect the current owner and user
            store.dispatch({
                type: 'SET_CURRENT_USER',
                uid: authData.uid
            });
            this.unsubscribe = store.subscribe(() =>
                this.forceUpdate()
            );

            this.pollsRef = base.listenTo('app/polls', {
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
            this.choicesRef = base.listenTo('app/choices', {
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

    }

    logout() {
        ref.unauth();
        const { store } = this.context;
        store.dispatch({type: 'CLEAR_CURRENT_USER'});
    }

    authHandler(err, authData) {
        var userRef;

        if(err) {
            console.log(err);
            return;
        }

        // is it a new user?
        ref.child("users").child(authData.uid).once('value', (snapshot) => {
            var exists = (snapshot.val() !== null);
            if(!exists){

                ref.child("users").child(authData.uid).set({
                    provider: authData.provider,
                    name: this.getName(authData)
                });

            }
            const { store } = this.context;
            // update our state to reflect the current owner and user
            store.dispatch({
                type: 'SET_CURRENT_USER',
                uid: authData.uid
            });
        });

    }

    getName(authData) {
        switch(authData.provider) {
            case 'github':
                return authData.github.displayName;
            case 'twitter':
                return authData.twitter.displayName;
        }
    }

    renderLogin() {
        return (
        <div className="row">
            <Header />
            <div className="columns">
                <h2 className="subheader">Log in to create polls</h2>

                <button className="large button" onClick={this.authenticate.bind(this, 'github')}>Log In with Github</button>
                <button className="large button" onClick={this.authenticate.bind(this, 'twitter')}>Log In with Twitter</button>
            </div>
        </div>
        )
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
            desc: poll.desc,
            owner: state.currentUser
        });

        base.post('app/polls/' + poll.id, {
            data: {desc: poll.desc, owner: state.currentUser},
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
        base.post('app/choices/' + choice.id, {
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

    getUserPolls(){
        const { store } = this.context;
        const state = store.getState();
        return state.polls.filter((poll) => {
            return state.currentUser === poll.owner;
        });
    }

    render(){
        let logoutButton = <button className="large button" onClick={this.logout}>Log Out!</button>

        // first check if they arent logged in
        const { store } = this.context;
        const state = store.getState();
        if(!state.currentUser) {
            return (
                <div>{this.renderLogin()}</div>
            )
        }

        var details, userPolls = this.getUserPolls();

        if(state.polls.length>=1){
            var pollID = state.currentPoll || state.polls[0];
            var poll = _.findWhere(state.polls,{id:pollID}) || {};
            var choices = _.where(state.choices,{pollID:pollID}) || [];
            details = <PollDetails loadPollDetails={this.loadPollDetails} currentPoll={state.currentPoll} addChoice={this.addChoice} pollDetails={poll} choices={choices} />;
        } else {
            details = '';
        }
        return (
            <div className="row">
                <Header />
                <div className="medium-6 columns">
                    {logoutButton}
                    <PollList polls={userPolls} loadPollDetails={this.loadPollDetails} />
                </div>
                <div className="medium-6 columns">
                    <AddPollForm loadPollDetails={this.loadPollDetails} currentPoll={state.currentPoll} addPoll={this.addPoll} />
                    {details}
                </div>

            </div>
        );
    }
}

App.contextTypes = {
    store: React.PropTypes.object
};

module.exports = connect(state => (state), {})(App);
