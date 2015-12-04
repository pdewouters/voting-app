// Reducers
import { combineReducers } from 'redux'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router';
import _ from 'underscore';

const polls = (state = [], action) => {
    switch(action.type){
        case 'LOAD_POLL':

            if(_.findWhere(state,{id:action.poll.key})){
                return state;
            } else {
                return [
                    ...state,
                    {
                        id: action.poll.key,
                        desc: action.poll.desc,
                    }
                ];
            }

        case 'ADD_POLL':
            return [
                ...state,
                {
                    id: action.id,
                    desc: action.desc
                }
            ];
        default:
            return state;
    }
};

const choices = (state = [], action) => {
    switch(action.type){
        case 'LOAD_CHOICE':
            if(_.findWhere(state,{id:action.choice.key})){
                return state;
            } else {
                return [
                    ...state,
                    {
                        id: action.choice.key,
                        desc: action.choice.desc,
                        pollID: action.choice.pollID,
                        voteTally: action.choice.voteTally
                    }
                ];
            }
        case 'ADD_CHOICE':
            return [
                ...state,
                {
                    id: action.id,
                    desc: action.desc,
                    pollID: action.pollID,
                    voteTally: action.voteTally
                }
            ];
        case 'CAST_VOTE':
            // increment votetally for choice
            var index = _.findIndex(state,{id:action.choice.id});
            return [
                ...state.slice(0,index),
                {
                    id: action.choice.id,
                    desc: action.choice.desc,
                    pollID: action.choice.pollID,
                    voteTally: action.choice.voteTally
                },
                ...state.slice(index + 1)
            ];
        default:
            return state;
    }
};

const currentPoll = (state = '', action) => {
    switch(action.type){
        case 'SET_CURRENT_POLL':
            return action.pollID;
        default:
            return state;
    }
};

const currentUser = (state = '', action) => {
  switch(action.type){
      case 'SET_CURRENT_USER':
          return action.uid;
      case 'CLEAR_CURRENT_USER':
          return null;
      default:
          return state;
  }
};

const owner = (state = '', action) => {
    switch(action.type){
        case 'SET_OWNER':
            return action.owner;
        case 'CLEAR_OWNER':
            return null;
        default:
            return state;
    }
};

const reducers = combineReducers(Object.assign({}, {
    polls,
    choices,
    currentPoll,
    currentUser,
    owner
}, {
    routing: routeReducer
}))

export default reducers;
