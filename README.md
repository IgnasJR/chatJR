### My attempt at learning NodeJS, SQL, React by creating a simple e2ee chat platform.

#### TODO:

- [x] Chat starts at bottom
- [x] Scroll to bottom on new message
- [x] Fixing UI for mobile
- [x] Loading a limited number of messages at a time
- [x] Loading more messages on scroll up
- [ ] Adding users using their username, instead of their user_id
- [ ] Adding alerts (sweetalert)
- [ ] If no messages on appear on scroll up, stop requesting
- [x] Log out button
- [x] Time-out for tokens
- [ ] Remove conversation
- [ ] New styles for 'secret' messages
- [ ] Button to enter 'secret' mode
- [ ] Implementing E2EE communication using sockets (without storing the messages in the database)

#### BUG-FIXES

- [x] When a user reselects a conversation, lastMessageId doesnt get cleared
- [x] User is able to send an empty message
