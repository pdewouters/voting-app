import React from 'react';
import { Link } from 'react-router';
import autobind from 'autobind-decorator';
import { updatePath } from 'redux-simple-router';

@autobind
class PollList extends React.Component {

    handleClick(e){
        e.preventDefault();
        // load poll details into component
        var pollID = e.target.getAttribute('data-id');
        this.props.loadPollDetails(pollID);
    }

    renderPoll(poll,index){
        const { store } = this.context;
        const state = store.getState();
        return <li index={index} key={index}>
            <a target='_blank' onClick={this.handleClick} data-id={poll.id} href="#">{poll.desc}</a> - <button onClick={() => store.dispatch(updatePath('/public/polls/'+poll.id))}>Vote</button> - <button onClick={() => store.dispatch(updatePath('/public/polls/results/'+poll.id))}>Results</button>
        </li>
    }

    render(){
        return (
            <ul>
                {this.props.polls.map(this.renderPoll)}
            </ul>
        );
    }
}

PollList.propTypes = {
    loadPollDetails: React.PropTypes.func.isRequired,
    polls: React.PropTypes.array.isRequired
};

PollList.contextTypes = {
    store: React.PropTypes.object
};

export default PollList;
