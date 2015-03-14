var React = require('react');
var _ = require('lodash');
var $ = require('jquery');
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

        this.props.model.addUser(userData).then(this.props.onAddUser, alert);
    },

    handleKeyDown: function(event) {
        if (event.which === ENTER_KEY) {
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
                <input name="username" ref="newName"
                       onKeyDown={this.handleKeyDown} onChange={this.handleUsername}/>

                <input name="password" type="password"
                       onKeyDown={this.handleKeyDown} onChange={this.handlePassword}/>
                <input type="checkbox" name="isAdmin" ref="newAdmin"
                       onChange={this.handleCheckbox}/>
                <label for={this.refs.newAdmin}/>
            </div>
        );
    }
});

var UserList = React.createClass({
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
            <NewUser model={this.props.model}
                     onAddUser={this.addUser.bind(this)}/>
          </li>);
        return (<ul>{users}</ul>);
    }
});

var render = module.exports.render = function(src, elementId) {
    var model = connect(src);
    React.render(<UserList model={model}/>,
                 document.getElementById(elementId));
};
