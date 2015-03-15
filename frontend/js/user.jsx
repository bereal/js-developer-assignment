var React = require('react');
var _ = require('lodash');
var classNames = require('classnames');
var connect = require('./userModel').connect;


/**
   User creation form
   Usage:
   <NewUser model={model} onError={errorHandler}
                          onAddUser={successCallback} />
 */
var NewUser = React.createClass({
    getInitialState: function() {
        return { };
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
        var title = "Fill username and password and press Enter to add a user";
        return (<div>
            <input name="username" ref="username" placeholder="Username" title={title}
                   onKeyDown={this.handleKeyDown} onChange={this.handleUsername}/>

            <input name="password" type="password" ref="password"
                   placeholder="Password" title={title}
                   onKeyDown={this.handleKeyDown} onChange={this.handlePassword}/>

            <input type="checkbox" name="isAdmin" ref="newAdmin"
                   onChange={this.handleCheckbox}/>
            <label for={this.refs.newAdmin}>Admin</label>
       </div>);
    }
});


/**
   Usage:
   <UserList model={model} [onError={errorHandler} | alert]/>
 */
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
        var header = (
            <thead>
                <tr><th>#</th><th>Username</th><th>Roles</th></tr>
            </thead>
        );
        var users = this.state.users.map(function(user) {
            return (
                <tr key={user.id}>
                  <td width="5%">{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.roles.join(', ')}</td>
                </tr>
            );
        });
        users.push(
          <tr key="0">
          <td colSpan="3">
            <NewUser ref="newUser"
                     model={this.props.model}
                     onAddUser={this.addUser}
                     onError={this.props.onError || alert}/>
          </td>
          </tr>);
        return (<table>{header}<tbody>{users}</tbody></table>);
    }
});


module.exports.render = function(src, elementId) {
    var model = connect(src);
    React.render(<UserList model={model}/>,
                 document.getElementById(elementId));
};
