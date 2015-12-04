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
        return <tr index={index} key={index}>
            <td>
            <h3 className="subheading"><a target='_blank' onClick={this.handleClick} data-id={poll.id} href="#">{poll.desc}</a></h3>
            <div className="button-group">
                <button className="button" onClick={() => store.dispatch(updatePath('/public/polls/'+poll.id))}>Vote</button>
                <button className="button" onClick={() => store.dispatch(updatePath('/public/polls/results/'+poll.id))}>Results</button>
            </div>
            </td>
        </tr>
    }

    render(){
        return (
            <table>
                <thead>
                <tr>
                    <th width="200">Polls</th>
                </tr>
                </thead>
                <tbody>
                {this.props.polls.map(this.renderPoll)}
                </tbody>
            </table>
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
