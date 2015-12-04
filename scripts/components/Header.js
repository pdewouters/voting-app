import React from 'react';
import { Link } from 'react-router';

class Header extends React.Component {
    render(){
        return (
            <div className="page-header columns">
                <h1><Link to="/">My Polls</Link></h1>
                <hr />
            </div>
        );
    }
}

export default Header;
