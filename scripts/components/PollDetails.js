import React from 'react';
import AddChoiceForm from './AddChoiceForm.js';
import autobind from 'autobind-decorator';

@autobind
class PollDetails extends React.Component {

    renderChoice(choice,index){
        return <li index={index} key={index}>
            {choice.desc}
        </li>
    }

    render(){
        return (
            <div>
                <h2 className="subheader">Details: {this.props.pollDetails? this.props.pollDetails.desc : ''}</h2>
                <input type="text" disabled value={window.location.href + 'public/polls/' + this.props.pollDetails.id} />
                <AddChoiceForm loadPollDetails={this.props.loadPollDetails} currentPoll={this.props.currentPoll} addChoice={this.props.addChoice} />

                <ul className="no-bullet">
                    {this.props.choices.map(this.renderChoice)}
                </ul>
            </div>
        );
    }
}

PollDetails.propTypes = {
    pollDetails: React.PropTypes.object.isRequired,
    loadPollDetails: React.PropTypes.func.isRequired,
    addChoice: React.PropTypes.func.isRequired,
    choices: React.PropTypes.array.isRequired,
    currentPoll: React.PropTypes.string.isRequired
};

export default PollDetails;
