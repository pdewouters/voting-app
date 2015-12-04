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
        console.log("Trying to auth with" + provider);
        base.authWithOAuthPopup(provider, this.authHandler);
    }
    componentDidMount() {
        var token = localStorage.getItem('token');
        if(token) {
            ref.authWithCustomToken(token,this.authHandler);
        }
        const { store } = this.context;
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

    logout() {
        base.unauth();
        localStorage.removeItem('token');
        const { store } = this.context;
        store.dispatch({type: 'CLEAR_CURRENT_USER'});
    }

    authHandler(err, authData) {
        if(err) {
            console.err(err);
            return;
        }

        // save the login token in the browser
        localStorage.setItem('token',authData.token);

        const storeRef = ref.child(authData.uid);
        storeRef.on('value', (snapshot) => {
            var data = snapshot.val() || {};

            // claim it as our own if there is no owner already
            if(!data.owner) {
                storeRef.set({
                    owner : authData.uid
                });
            }
            const { store } = this.context;
            // update our state to reflect the current store owner and user
            store.dispatch({
                type: 'SET_CURRENT_USER',
                uid: authData.uid
            });

            store.dispatch({
                type: 'SET_OWNER',
                owner : data.owner || authData.uid
            });

        });
    }

    renderLogin() {
        return (
            <nav className="login">
                <h2>Polls</h2>
                <p>Sign in to manage your polls</p>
                <button className="large button" onClick={this.authenticate.bind(this, 'github')}>Log In with Github</button>

            </nav>
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
            desc: poll.desc
        });

        base.post('app/polls/' + poll.id, {
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

        // then check if they arent the owner of the current store
        if(state.currentUser !== state.owner) {
            return (
                <div>
                    <p>Sorry, you aren't the owner of this store</p>
                    {logoutButton}
                </div>
            )
        }
        var details;

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
                    <PollList polls={state.polls} loadPollDetails={this.loadPollDetails} />
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
