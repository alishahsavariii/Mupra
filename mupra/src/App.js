import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AddUserForm from './components/AddUserForm';
import UserList from './components/UserList';
import './App.css';

const getManualUsersFromStorage = () => {
  const savedUsers = localStorage.getItem('manualUsers');
  return savedUsers ? JSON.parse(savedUsers) : [];
};

const RESULTS_PER_PAGE = 30;

function App() {
  const [users, setUsers] = useState(() => getManualUsersFromStorage());
  const [loading, setLoading] = useState(false); 
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const lastUserElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchApiUsers = useCallback(async (currentPage) => {
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const response = await fetch(`https://randomuser.me/api/?page=${currentPage}&results=${RESULTS_PER_PAGE}&seed=pendar`);
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات از سرور');
      
      const data = await response.json();

      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        if (currentPage === 1) {
          const manualUsers = getManualUsersFromStorage();
          setUsers([...manualUsers, ...data.results]);
        } else {
          setUsers(prevUsers => [...prevUsers, ...data.results]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); 
  useEffect(() => {
    fetchApiUsers(page);
  }, [fetchApiUsers, page]);

  const handleAddUser = (newUser) => {
    const userToAdd = {
      login: { uuid: `custom-${Date.now()}` },
      name: { first: newUser.name, last: '' },
      email: newUser.email,
      picture: { large: newUser.profilePicUrl}
    };
    
    const currentManualUsers = getManualUsersFromStorage();
    const updatedManualUsers = [userToAdd, ...currentManualUsers];
    localStorage.setItem('manualUsers', JSON.stringify(updatedManualUsers));

    const apiUsers = users.filter(u => !u.login.uuid.startsWith('custom'));
    setUsers([...updatedManualUsers, ...apiUsers]);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>مدیریت کاربران</h1>
        </header>
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<AddUserForm onUserAdded={handleAddUser} />} 
            />
            <Route 
              path="/users" 
              element={
                <UserList
                  users={users}
                  loading={loading}
                  loadingMore={loadingMore}
                  error={error}
                  onRetry={() => {
                    setPage(1);
                    fetchApiUsers(1);
                  }}
                  lastUserRef={lastUserElementRef}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;