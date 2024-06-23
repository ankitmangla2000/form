import React from 'react';
import { useNavigate } from 'react-router-dom';

const SecondPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Second Page</h1>
      <button onClick={() => navigate(-1)}>Previous</button>
    </div>
  );
};

export default SecondPage;
