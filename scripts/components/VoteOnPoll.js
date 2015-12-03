import React from 'react';
import _ from 'underscore';
import Header from './Header.js';
import Rebase from 're-base';
import { updatePath } from 'redux-simple-router';
import autobind from 'autobind-decorator';
const base = Rebase.createClass('https://paulwp-polls-fcc.firebaseio.com');

@autobind
class VoteOnPoll extends React.Component {

    componentDidMount() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() =>
            this.forceUpdate()
        );
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
        base.removeBinding(this.choicesRef);
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
        base.post('paulwp/choices/' + choice.id, {

            data: {desc: choice.desc, pollID: choice.pollID, voteTally: choice.voteTally},
            then(){
                store.dispatch(updatePath('/public/polls/results/'+pollID))
            }
        });
    }

    render(){
        const { store } = this.context;
        var state = store.getState();
        var poll = _.findWhere(state.polls,{id:this.props.params.pollID});
        var choices = _.where(state.choices,{pollID:this.props.params.pollID});
        return (
            <div>
                <Header />
                <ul>
                    {choices.map((choice,index) => {
                        return <li key={index}><a onClick={this.handleClick} href="#" data-id={choice.id}>{choice.desc}</a></li>
                    })}
                </ul>
            </div>
        );
    }
}

VoteOnPoll.contextTypes = {
    store: React.PropTypes.object
};

export default VoteOnPoll;
