const Conversation = ({sidebarOpen, handleSendMessageClick, messageEl, lastMessageRef, currentUserId,messages, newMessage, handleInputChange}) => {
    return(
        <div>
            <div className={`message-container`}>
                <ul className={`message-list ${sidebarOpen ? 'open-chat' : 'closed-chat'}`} ref={messageEl}>
                    {messages.map((message, index) => (
                        <li key={message.message_id} className={`message-item `}>
                        <div className="message-sender" ref={index === 0 ? lastMessageRef : null}>{message.sender_name}</div>
                        <div className={`message-content ${message.sender_id === currentUserId ? 'self-message self-public-message' : 'other-message other-public-message'}`}>
                            {message.message_content}
                        </div>
                        </li>
                    ))}
                </ul>
            </div>
        <div className={`input-container ${sidebarOpen ? 'open-chat' : 'closed-chat'}`}>
            <form onSubmit={handleSendMessageClick}>
            <input
                className="send-textbox"
                type="text"
                placeholder="New Message"
                value={newMessage}
                onChange={handleInputChange}
            />
            <button type="submit" className="send-button"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 512 512"><path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z" /></svg></button>
            </form>
        </div>
    </div>
    );
}

export default Conversation;