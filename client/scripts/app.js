class App {
  constructor() {
    this.server = 'http://parse.sfm8.hackreactor.com/';
    this.friendsList = {};
    this.rooms = { 'All Messages': [] };
    this.currentRoom = 'All Messages';
  }

  init() {
    this.fetch();
    // Submit Button Click Event Listener
    $('#send .submit').on('click', (event) => {
      event.preventDefault();
      let newMessageObj = {};
      newMessageObj.text = $('#inputMessage').val();
      newMessageObj.username = window.location.search.replace(/[?]username=/, '');
      newMessageObj.roomname = this.currentRoom;
      $('#inputMessage').val('');
      newMessageObj.text !== '' ? this.handleSubmit(newMessageObj) : null;
    });
    // Room Select Change Event Listener
    $(document).on('change', '#roomSelect', (event) => {
      let selectedRoom = $(event.target).val();
      if (selectedRoom === 'Create Room') {
        let inputRoomName = prompt('Room Name: ', 'Enter here');
        selectedRoom = inputRoomName;
      }
      this.currentRoom = selectedRoom;
      $('.spinner').toggle();
      app.fetch();
    });
    // Add Friend Event Listener
    $(document).on('click', '.addFriendButton', (event) => {
      let friendUsername = $(event.target).parent().find('.username').text();
      if ($(event.target).text() === 'Add Friend') {
        $('#chats').find('.username').each( function() {
          if ($(this).text() === friendUsername) {
            $(this).next().next().toggleClass('friendButton');
            $(this).next().next().text('Following');
            $(this).parent().addClass('friend');
          }
        });
        this.friendsList[friendUsername] = friendUsername; 
      } else {
        $('#chats').find('.username').each( function() {
          if ($(this).text() === friendUsername) {
            $(this).next().next().toggleClass('friendButton');
            $(this).next().next().text('Add Friend');
            $(this).parent().removeClass('friend');
          }
        });
        delete this.friendsList[friendUsername];
      }
    });
    // Refresh Page Event Listener
    $(document).on('click', '#refresh', () => {
      $('.spinner').toggle();
      this.fetch();
    });
  }

  send(messageObj) {
    $.ajax({
      url: `${this.server}chatterbox/classes/messages`,
      type: 'POST',
      data: JSON.stringify(messageObj),
      contentType: 'application/json',
      success: (data) => {
        console.log(`chatterbox: Message sent ${data}`)
        app.fetch();
      },
      error: () => { console.error(`chatterbox: Failed to send message`); },
    });
  }

  fetch() {
    $.ajax({
      url: `${this.server}chatterbox/classes/messages`,
      type: 'GET',
      data: {limit: 300, order: '-createdAt'},
      contentType: 'application/json',
      success: (data) => {
        console.log(`chatterbox: Message received from GET ${data}`);
        this.parseData(data.results);
        this.renderPage();
      },
      error: () => { console.error(`chatterbox: Failed to GET`); }
    });
  }

  parseData(dataArray) {
    let newRoomsObj = { 'All Messages': [] };
    dataArray.forEach( (dataMessageObj) => {
      let newMessageTag = this.createMessageTag(dataMessageObj);
      if (dataMessageObj.roomname) {
        dataMessageObj.roomname = dataMessageObj.roomname.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      } else {
        dataMessageObj.roomname = 'All Messages';
      }
      if (!newRoomsObj.hasOwnProperty(dataMessageObj.roomname)) {
        newRoomsObj[dataMessageObj.roomname] = [];
      }
      if (dataMessageObj.roomname !== 'All Messages') {
        newRoomsObj['All Messages'].push(newMessageTag);
      }
      newRoomsObj[dataMessageObj.roomname].push(newMessageTag);
    });
    this.rooms = newRoomsObj;
  }

  createMessageTag(dataMessageObj) {
    let $messageContainer = $('<div>').addClass('messageBox');
    let $usernameTag = $('<span>').addClass('username').text(dataMessageObj.username);
    let $messageTag = $('<div>').addClass('message-text').text(dataMessageObj.text);
    let $friendButton = $('<button>').addClass('addFriendButton').text('Add Friend');
    $messageContainer.append($usernameTag);
    $messageContainer.append($messageTag);
    $messageContainer.append($friendButton);
    return $messageContainer;
  }

  renderMessage($message) {
    $('#chats').append($message);
  }

  renderRoom(room) {
    let $room = $('<option>').attr('value', room).text(room);
    $('#roomSelect').append($room);
  }

  clearMessages() {
    $('#chats').empty();
    $('#roomSelect').empty();
  }

  renderPage() {
    this.clearMessages();
    let $createRoom = $('<option>').attr('value', 'Create Room').text('Create Room')
    $('#roomSelect').append($createRoom);
    if (!this.rooms[this.currentRoom]) {
      this.rooms[this.currentRoom] = [];
    }
    for (var key in this.rooms) {
      this.renderRoom(key);
    }
    $('#roomSelect').val(this.currentRoom);
    if (this.rooms[this.currentRoom]) {
      this.rooms[this.currentRoom].forEach( (message) => { this.renderMessage(message); });
    }
    $('.spinner').toggle();
  }

  handleSubmit(inputMessage) {
    $('.spinner').toggle();
    app.send(inputMessage);
  }
}

let app = new App();
app.init();
