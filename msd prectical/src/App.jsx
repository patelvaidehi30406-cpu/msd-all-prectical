import React from 'react';
import './App.css';

function StudentCard(props) {
  return (
    <div className="student-card">
      <h2>{props.name}</h2>
      <p>Course: {props.course}</p>
      <p>College: Ganpat University</p>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <h1>Student Information System</h1>
      <p>React Functional Components and JSX</p>

      <div className="student-list">
        <StudentCard name="Vaidehi" course="B.Sc. CA & IT" />
        <StudentCard name="Riya" course="BCA" />
        <StudentCard name="Priya" course="B.Tech" />
      </div>
    </div>
  );
}

export default App;
