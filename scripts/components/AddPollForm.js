import React from 'react';
import autobind from 'autobind-decorator';

@autobind
class AddPollForm extends React.Component {

    handleSubmit(e){
        e.preventDefault();
        var timestamp = (new Date()).getTime();
        var poll = {
            id: 'poll-' + timestamp,
            desc: this.refs.pollName.value
        };
        this.props.addPoll(poll);
        this.props.loadPollDetails(poll.id);
        this.refs.pollName.value = '';
    }

    render(){
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add Poll</label>
                <input ref="pollName" type="text" />
                <input type="submit" />
            </form>
        );
    }
}

AddPollForm.propTypes =  {
    loadPollDetails: React.PropTypes.func.isRequired,
    addPoll: React.PropTypes.func.isRequired
};

export default AddPollForm;
