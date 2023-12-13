CREATE TABLE
    Conversations (
        conversation_id INT PRIMARY KEY AUTO_INCREMENT,
        user1_id INT NOT NULL,
        user2_id INT NOT NULL,
        FOREIGN KEY (user1_id) REFERENCES Users(id),
        FOREIGN KEY (user2_id) REFERENCES Users(id)
    );

CREATE TABLE
    Messages (
        message_id INT PRIMARY KEY AUTO_INCREMENT,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        recipient_id INT NOT NULL,
        message_content TEXT NOT NULL,
        created_at DATETIME NOT NULL,
    );

CREATE TABLE
    Conversations (
        conversation_id INT PRIMARY KEY AUTO_INCREMENT,
        user1_id INT NOT NULL,
        user2_id INT NOT NULL,
        FOREIGN KEY (user1_id) REFERENCES Users(id),
        FOREIGN KEY (user2_id) REFERENCES Users(id)
    );