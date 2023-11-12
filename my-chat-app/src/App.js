import React, { useState, useEffect } from 'react';
import Login from './Login';
import Chat from './Chat';

<<<<<<< HEAD
const io = require('socket.io-client');
=======
>>>>>>> parent of e949adf (Fixed sockets)
var CryptoJS = require('crypto-js');

function App() {
  let [currentUserId, setCurrentUserId] = useState();
  let [conversations, setConversations] = useState([]);
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let [token, setToken] = useState('');
  let [messages, setMessages] = useState([]);
  let [newMessage, setNewMessage] = useState('');
  let [selectedUser, setSelectedUser] = useState('');
  let handleUserSelection = (userId) => {
    setSelectedUser(userId);
  };
  useEffect(() => {
<<<<<<< HEAD
    if(token){

      let newSocket = io.connect('ws://localhost:8080/', connectionOptions);
      // Set the socket state
      setSocket(newSocket);
      console.log("Succesfully connected to a socket");
      if (selectedUser){
        socket.emit('authenticate', { token: token, conversationId: selectedUser });
        socket.on('message', function(messageContent) {
          setMessages(prevMessages => [...prevMessages, messageContent]);
          console.log('Updated Messages:', messages);          
        });
      }
      fetchConversations();
      fetchMessages(selectedUser);
      return () => {
        if (socket){
          socket.disconnect();
        }
      }
    }}, [token, selectedUser]);
=======
    fetchConversations();
    fetchMessages(selectedUser);
  }, [token, selectedUser]);
>>>>>>> parent of e949adf (Fixed sockets)
  
  let handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

<<<<<<< HEAD
=======
  const storedPrivateKey = localStorage.getItem('privateKey');

>>>>>>> parent of e949adf (Fixed sockets)
  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setConversations(data);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddConversation = async (newUserInput) => {
    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: newUserInput }),
      });

      const data = await response.json();
      if (response.ok) {
        setConversations([
          ...conversations,
          {
            conversation_id: data.conversationId,
            user_id: newUserInput,
            username: newUserInput,
          },
        ]);
        setSelectedUser(''); // Clear selected user
        // Fetch the updated conversations after successfully adding the new user
        fetchConversations();
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMessages = async (recipientId) => {
    try {
      if (recipientId) {
        const response = await fetch(`http://localhost:3001/api/messages/${selectedUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setMessages(data);
        } else {
          console.error('Error:', data.error);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!selectedUser) {
        console.error('No conversation selected');
        return;
      }
<<<<<<< HEAD
      const response = await fetch('http://localhost:3001/api/messages', {
=======
  
      const response = await fetch('http://localhost:3002/messages', {
>>>>>>> parent of e949adf (Fixed sockets)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedUser,
          messageContent: newMessage,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedUser);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
  const handleLogin = async (username, password) => {
    var algo = CryptoJS.algo.SHA256.create();
    algo.update(password, 'utf-8');
    algo.update(CryptoJS.SHA256(username), 'utf-8');
    var hash = algo.finalize().toString(CryptoJS.enc.Base64);
    console.log(hash);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: hash }),
      });

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setCurrentUserId(data.userId);
        setUsername('');
        setPassword('');
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      {token ? (
        <Chat
          currentUserId={currentUserId}
          token={token}
          conversations={conversations}
          messages={messages}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          handleAddConversation={handleAddConversation}
          handleInputChange={handleInputChange}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleUserSelection={handleUserSelection}
        />
      ) : (
        <Login handleLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
