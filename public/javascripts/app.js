App = Ember.Application.create();

App.Router.map(function() {
	this.resource('index', { path: '/'});
	this.resource('rooms', { path: 'rooms'}, function() {
		this.route('chat', { path: ':name'});
	});

});

App.RoomsRoute = Ember.Route.extend({
	setupController: function(controller) {
		controller.set('content', [
			{id: 1, name: 'Room 1'},
			{id: 2, name: 'Room 2'}
		]);
	}
});

App.RoomsChatController = Ember.ObjectController.extend({
	ws: 'ws://localhost:9000/room/chat',
	username: null,
	socket: null,
	messages: [],
	isAlreadyJoin: false,
	message: null,
	members: [],
	actions: {
		talk: function(model) {

			var self = this,
					message = model.message,
					param = JSON.stringify({"text":message});

			this.get('socket').send(param);

			this.get('socket').onmessage = function(event) {
				console.log('--talk--');
				console.log(event);
				var json = JSON.parse(event.data);

				var model = Em.Object.create({
											user: json.user, 
											message: json.message
										});

				json.members.forEach(function(member, index) {
					self.get('members').pushObject(member);
				});
				self.get('messages').pushObject(model);

			};

		},
		join: function(model) {

			var username = model.username,
					ws = new WebSocket(this.get('ws') + "?username="+username),
					self = this;

			ws.onmessage = function(event) {
				console.log('--join--');
				console.log(event);
				var json = JSON.parse(event.data),
						model = null;

				if (json.user) {
					model = Em.Object.create({
												user: json.user, 
												message: json.message
											});

					self.get('messages').pushObject(json.message);
				}else {

					alert('This username is already used');
					self.set('isAlreadyJoin', false);

				}

			};

			this.set('socket', ws);
			self.set('isAlreadyJoin', true);

		}
	}
});


App.ChatFormComponent = Ember.Component.extend({
	talkAction: 'talk',
	actions: {
		talk: function() {
			this.sendAction('talkAction', this.get('user'));
		}
	}
});

App.ChatLoginComponent = Ember.Component.extend({
	joinAction: 'join',
	actions: {
		join: function() {
			this.sendAction('joinAction', this.get('user'));
		}
	}
});
