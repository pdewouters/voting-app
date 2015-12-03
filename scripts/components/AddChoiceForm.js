import React from 'react';
import autobind from 'autobind-decorator';

@autobind
class AddChoiceForm extends React.Component {

    handleSubmit(e){
        e.preventDefault();
        var timestamp = (new Date()).getTime();
        var choice = {
            id: 'choice-' + timestamp,
            desc: this.refs.choiceText.value,
            pollID: this.props.currentPoll,
            voteTally: 0
        };
        this.props.addChoice(choice);
        this.props.loadPollDetails(this.props.currentPoll);
        this.refs.choiceText.value = '';
    }

    render(){
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add Choice</label>
                <input ref="choiceText" type="text" />
                <input type="submit" />
            </form>
        );
    }
}

AddChoiceForm.propTypes =  {
    loadPollDetails: React.PropTypes.func.isRequired,
    addChoice: React.PropTypes.func.isRequired,
    currentPoll: React.PropTypes.string.isRequired
};

export default AddChoiceForm;
