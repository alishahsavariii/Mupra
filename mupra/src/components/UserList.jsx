import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserCard = React.forwardRef(({ user, isSelected, onSelect }, ref) => (
  <div className={`user-card ${isSelected ? 'selected' : ''}`} ref={ref}>
    <input
      type="checkbox"
      checked={isSelected}
      onChange={() => onSelect(user.login.uuid)}
      className="card-checkbox"
    />
    <img src={user.picture.large} alt={`${user.name.first} ${user.name.last}`} />
    <div className="user-info">
      <h3>{`${user.name.first} ${user.name.last}`}</h3>
      <p>{user.email}</p>
    </div>
  </div>
));

const UserList = ({ users, loading, loadingMore, error, onRetry, lastUserRef }) => {
  const [selectedUsers, setSelectedUsers] = useState(() => {
    const saved = localStorage.getItem('selectedUsers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('selectedUsers', JSON.stringify(selectedUsers));
  }, [selectedUsers]);


  const handleSelectUser = (userId) => {
    setSelectedUsers(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  if (loading && users.length === 0) {
    return <div className="status-message">در حال بارگیری کاربران...</div>;
  }

  if (error && users.length === 0) {
    return (
      <div className="status-message error">
        {error}
        <button onClick={onRetry} style={{ marginTop: '10px' }}>تلاش مجدد</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>لیست کاربران ({users.length} نفر)</h2>
        <Link to="/" className="nav-link">افزودن کاربر جدید &larr;</Link>
      </div>
      <div className="user-list-container">
        {users.map((user, index) => {
          if (users.length === index + 1) {
            return (
              <UserCard
                ref={lastUserRef}
                key={user.login.uuid}
                user={user}
                isSelected={selectedUsers.includes(user.login.uuid)}
                onSelect={handleSelectUser}
              />
            );
          } else {
            return (
              <UserCard
                key={user.login.uuid}
                user={user}
                isSelected={selectedUsers.includes(user.login.uuid)}
                onSelect={handleSelectUser}
              />
            );
          }
        })}
      </div>
      {loadingMore && <div className="loader-small">در حال بارگیری موارد بیشتر...</div>}
      {!loadingMore && error && <div className="status-message error small">خطا در بارگیری</div>}
    </div>
  );
};

export default UserList;