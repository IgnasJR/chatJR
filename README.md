### My attempt at learning NodeJS, SQL, React by creating a simple e2ee chat platform.

### TODO:

#### Pagination:

- [x] Chat starts at bottom
- [x] Loading a limited number of messages at a time
- [x] Scroll to bottom on new message
- [x] Loading more messages on scroll up
- [x] If no messages on appear on scroll up, stop requesting

#### E2EE:

- [x] New styles for 'secret' messages
- [x] Button to enter 'secret' mode
- [x] Implementing E2EE communication using sockets (without storing the messages in the database)
- [x] Fix storing of the private and public keys issue
- [ ] Implement secure AES key exchange

#### Other:

- [x] Fixing UI for mobile
- [x] Adding users using their username, instead of their user_id
- [ ] Adding alerts (sweetalert)
- [x] Log out button
- [x] Time-out for tokens
- [x] Remove conversation
- [ ] Modify Chat window UI

#### Bugs:

- [x] Users with empty username string can be created
- [x] No checking for multiple usernames
- [ ] Pressing enter while another message is being sent lets user send multiple copies of the same message
- [ ] Secret mode button needs a on hover explanation and be move somewhere, as it isn't intuitive
- [ ] Limit lenght of secret mode messages, while using RSA
- [x] No input validation for adding users

Not sure how, but multiple users with same username screw up conversations and messages
