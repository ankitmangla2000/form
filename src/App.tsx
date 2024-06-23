import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import ThirdPartyDesigneeForm from './components/ThirdPartyDesigneeForm';
import SecondPage from './components/SecondPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/form" element={<ThirdPartyDesigneeForm />} />
        <Route path="/second" element={<SecondPage />} />
      </Routes>
    </Router>
  );
}

export default App;
