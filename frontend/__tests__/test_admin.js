jest.autoMockOff();  // good design doesn't require automocks

var React = require('react/addons');
var UserList = require('../js/user.jsx').UserList;
var TestUtils = React.addons.TestUtils;
var Simulate = TestUtils.Simulate;

function MockModel(users, err) {
    this.users = users || [];
    this.err = err;
}

function resolve(value) {
    return {
        then: function(ok, _) {
            ok(value)
        }
    }
}

function reject(value) {
    return {
        then: function(_, fail) {
            fail(value);
        }
    }
}
MockModel.prototype = {
    list: function() {
        return resolve([]);
    },

    addUser: function(user) {
        if (this.err) return reject(this.err);
        this.users.push(user);
        return resolve(user);
    }
};

var UL, Model, Username, Password;

describe('UserList component', function() {
    beforeEach(function() {
        Model = new MockModel();
        UL = TestUtils.renderIntoDocument(
                <UserList model={Model}/>
        );

        Password = React.findDOMNode(UL.refs.newUser.refs.password);
        Username = React.findDOMNode(UL.refs.newUser.refs.username);
        Checkbox = React.findDOMNode(UL.refs.newUser.refs.newAdmin);

    }),

    it('should add a user', function() {
        Simulate.change(Username, {target: {value: 'user'}});
        Simulate.change(Password, {target: {value: 'secret'}});

        Simulate.keyDown(Username, {key: 'Enter'});

        expect(Model.users.length).toBe(1);
        expect(Model.users[0]).toEqual({username: 'user',
                                        password: 'secret',
                                        roles: []});
    });

    it('should add an admin user', function() {
        Simulate.change(Username, {target: {value: 'user'}});
        Simulate.change(Password, {target: {value: 'secret'}});
        Simulate.change(Checkbox, {target: {checked: true}});

        Simulate.keyDown(Username, {key: 'Enter'});

        expect(Model.users.length).toBe(1);
        expect(Model.users[0]).toEqual({username: 'user',
                                        password: 'secret',
                                        roles: ['admin']});

    });

    it('should handle model errors', function() {
        var model = new MockModel([], reject('Oops'));
        var onError = jest.genMockFunction();

        var ul = TestUtils.renderIntoDocument(
                <UserList model={model} onError={onError}/>
        );
        var username = React.findDOMNode(ul.refs.newUser.refs.username);
        Simulate.keyDown(username, {key: 'Enter'});

        expect(onError).toBeCalled();
    });
});
