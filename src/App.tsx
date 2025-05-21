import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import LoginPage from './LoginPage';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<PrivateRoute />}>
          <Route index element={<AdminPanel />} />
        </Route>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
