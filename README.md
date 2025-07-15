# Chat App

A full-stack end-to-end encrypted chat app, built using **React** for the frontend and **Node.js** for the backend.

## Features

- **Responsive UI**: Works on desktop and mobile browsers.
- **Cryptographically secure**: each conversation uses AES encryption - when a user creates a new conversation between two users, the other participants public RSA key is received from the server, it's then used to encrypt the original AES key for later storage on the server, allowing only the two participants in a conversation to know the original AES key, therefore allowing only them to read the conversation contents.
- **Automatic message receiving**: each message is transmitted to its receiver using websockets, allowing faster message travel time.

---

## Technologies Used

### Frontend

- React

### Backend

- Node.js
- Express
- MySQL
- JWT for authentication

---

## Planned Enhancements

- Integrate **Redis** to manage user sessions, allowing for server-side invalidation of tokens (e.g., on logout or change of password).
- Add OpenAPI documentation.
- Modify the current hashing and AES key derivation functionality to use a more robust algorithm

---

## Getting Started

### Prerequisites

1. Docker installed
2. MySQL running

---

### Installation

1. Clone this repository and open the project directory:

```sh
git clone https://github.com/IgnasJR/chatJR
cd chatJR
```

2. Create an environment variable file - run `touch .env`, and in the newly created file add these parameters:

```
SecretKey=randomly-generated-string
UsedPort=3002
DBHost=url-to-database (if youre running a docker container, use "host.docker.internal")
DBUser=your-db-user
DBPass=your-db-pass
DBName=chatapp
DBPort=your-db-port (usually 3306 for mariadb and mysql)
```

3. Build the image:

```sh
docker build --build-arg REACT_APP_SOCKET_URL=localhost:3001 -t chatjr .
```

4. Start a container:

```sh
docker run -p 3001:3001 -p 3002:3002 --env-file /path/to/env chatjr
```

5.  Open http://localhost:3002/ to view the project
