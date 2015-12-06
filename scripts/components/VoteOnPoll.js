import React from 'react';
import _ from 'underscore';
import { connect } from 'react-redux';
import Header from './Header.js';
import Rebase from 're-base';
import { updatePath } from 'redux-simple-router';
import autobind from 'autobind-decorator';
const base = Rebase.createClass('https://paulwp-polls-fcc.firebaseio.com');

@autobind
class VoteOnPoll extends React.Component {

    componentDidMount() { console.log('compomount');
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

    componentWillUnmount() { console.log('compomount');
        this.unsubscribe();
        base.removeBinding(this.choicesRef);
        base.removeBinding(this.pollsRef);
    }

    handleClick(e){
        e.preventDefault();
        const { store } = this.context;
        var state = store.getState();
        var choiceID = e.target.getAttribute('data-id');
        var choice = _.findWhere(state.choices,{id:choiceID});
        choice.voteTally += 1;
        store.dispatch({
            type: 'CAST_VOTE',
            choice: choice
        });

        var pollID =this.props.params.pollID;
        base.post('app/choices/' + choice.id, {

            data: {desc: choice.desc, pollID: choice.pollID, voteTally: choice.voteTally},
            then(){
                store.dispatch(updatePath('/public/polls/results/'+pollID))
            }
        });
    }

    render(){
        const { store } = this.context;
        var state = store.getState();
        if(state.polls.length===0) return false; // do not render before polls are loaded
        var poll = _.findWhere(state.polls,{id:this.props.params.pollID});
        var choices = _.where(state.choices,{pollID:this.props.params.pollID});
        return (
            <div className="row">
                <Header />
                <div className="columns">
                    <h2 className="subheader">Choices: {poll.desc}</h2>

                    <ul className="no-bullet">
                        {choices.map((choice,index) => {
                            return <li key={index}><a onClick={this.handleClick} href="#" data-id={choice.id}>{choice.desc}</a></li>
                        })}
                    </ul>
                </div>
            </div>
        );
    }
}

VoteOnPoll.contextTypes = {
    store: React.PropTypes.object
};

module.exports = connect(state => (state), {})(VoteOnPoll);
