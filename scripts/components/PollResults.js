import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import Header from './Header';
import Rebase from 're-base';
const base = Rebase.createClass('https://paulwp-polls-fcc.firebaseio.com');
import autobind from 'autobind-decorator';

@autobind
class PollResults extends React.Component {

    componentDidMount() {
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

    componentWillUnmount() {
        this.unsubscribe();
        base.removeBinding(this.pollsRef);
        base.removeBinding(this.choicesRef);
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
                    <h2 className="subheader">Results for: {poll.desc}</h2>

                    <ul className="no-bullet">
                        {choices.map((choice,index) => {
                            return <li key={index}>{choice.desc} : {choice.voteTally}</li>
                        })}
                    </ul>
                </div>
            </div>
        );
    }
}

PollResults.contextTypes = {
    store: React.PropTypes.object
};

module.exports = connect(state => (state), {})(PollResults);
