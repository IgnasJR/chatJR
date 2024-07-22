const Header = ({selectedUsername, toggleSidebar, logOut}) => {
    return(
        <div className={`msg-header`}>
        <div className="header-content">
          <h2 style={{ paddingLeft: '1em', cursor: 'pointer' }} onClick={toggleSidebar}>☰</h2>
          <h2 style={{ paddingLeft: '1em' }}>{selectedUsername ? selectedUsername : 'Select a conversation'}</h2>
          <div style={{ position: 'absolute', right: '1em', cursor: 'pointer' }} data-tooltip="Logout" data-tooltip-position="bottom">
            <svg onClick={logOut} style={{ marginLeft: "auto", paddingRight: '1em', cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -50 512 512"><path fill="white" d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z" /></svg>
          </div>
        </div>
      </div>
    );
}
export default Header;