var React = require('react');
var _ = require('lodash');
var classNames = require('classnames');
var connect = require('./userModel').connect;

var User = React.createClass({
    getInitialState: function() {
        return this.props.data || {username: '', roles: []};
    },

    render: function() {
        var user = this.props.data;
        var classes = classNames({
            'admin': _.contains(user.roles, 'admin'),
        });
        return (
            <div className={classes}>
                {user.username}
            </div>
        );
    }
});


var ENTER_KEY = 13;

var NewUser = React.createClass({
    getInitialState: function() {
        return { isAdmin: false };
    },

    submit: function() {
        var roles = [];
        if (this.state.isAdmin) {
            roles.push('admin');
        }

        var userData = {
            username: this.state.username,
            password: this.state.password,
            roles: roles
        };

        var success = function(data) {
            this.props.onAddUser(data);
        }.bind(this);

        this.props.model.addUser(userData).then(this.props.onAddUser, this.props.onError);
    },

    handleKeyDown: function(event) {
        if (event.key === 'Enter') {
            this.submit();
        }
    },

    handleCheckbox: function(event) {
        this.setState({isAdmin: event.target.checked});
    },

    handleUsername: function(event) {
        this.setState({username: event.target.value});
    },

    handlePassword: function(event) {
        this.setState({password: event.target.value});
    },

    render: function() {
        return (
            <div className="new">
                <input name="username" ref="username"
                       onKeyDown={this.handleKeyDown} onChange={this.handleUsername}/>

                <input name="password" type="password" ref="password"
                       onKeyDown={this.handleKeyDown} onChange={this.handlePassword}/>

                <input type="checkbox" name="isAdmin" ref="newAdmin"
                       onChange={this.handleCheckbox}/>
                <label for={this.refs.newAdmin}/>
            </div>
        );
    }
});


var UserList = module.exports.UserList = React.createClass({
    getInitialState: function () {
        return { users: [] };
    },

    componentDidMount: function() {
        this.props.model.list().then(function(data) {
            this.setState({users: data})
        }.bind(this));
    },

    addUser: function(user) {
        var users = this.state.users;
        users.push(user);
        this.setState({users: users});
    },

    render: function() {
        var users = this.state.users.map(function(user) {
            return (<li><User data={user}/></li>);
        });
        users.push(
          <li>
            <NewUser ref="newUser"
                     model={this.props.model}
                     onAddUser={this.addUser}
                     onError={this.props.onError || alert}/>
          </li>);
        return (<ul>{users}</ul>);
    }
});


module.exports.render = function(src, elementId) {
    var model = connect(src);
    React.render(<UserList model={model}/>,
                 document.getElementById(elementId));
};
