import { useState } from 'react';
import './App.css';

function StudentInfo({ rollNo, name, course, semester, grade, email }) {
  return (
    <div className="student-card">
      <div className="student-header">
        <h2>{name}</h2>
        <span className="roll-badge">Roll No: {rollNo}</span>
      </div>
      <p><strong>Course:</strong> {course}</p>
      <p><strong>Semester:</strong> {semester}</p>
      <p><strong>Grade:</strong> {grade}</p>
      <p><strong>Email:</strong> {email}</p>
    </div>
  );
}

function App() {
  const students = [
    {
      rollNo: "101",
      name: "Vaidehi",
      course: "B.Sc. CA & IT",
      semester: "4th Sem",
      grade: "A+",
      email: "vaidehi@example.com",
    },
    {
      rollNo: "102",
      name: "Riya",
      course: "BCA",
      semester: "4th Sem",
      grade: "A",
      email: "riya@example.com",
    },
    {
      rollNo: "103",
      name: "Aarav",
      course: "B.Sc. IT",
      semester: "6th Sem",
      grade: "A+",
      email: "aarav@example.com",
    },
    {
      rollNo: "104",
      name: "Priya",
      course: "M.Sc. CA & IT",
      semester: "2nd Sem",
      grade: "A",
      email: "priya@example.com",
    },
    {
      rollNo: "105",
      name: "Rohan",
      course: "MCA",
      semester: "2nd Sem",
      grade: "B+",
      email: "rohan@example.com",
    },
  ];

  const [count, setCount] = useState(0);

  function increaseCount() {
    if (count < students.length) {
      setCount(count + 1);
    }
  }

  function decreaseCount() {
    if (count > 0) {
      setCount(count - 1);
    }
  }

  function resetCount() {
    setCount(0);
  }

  return (
    <div className="app">
      <h1>Student Management App</h1>
      <p className="subtitle">Practical 2: Props, State Management and Event Handling</p>

      <div className="counter">
        <h2>Student Counter</h2>
        <h1 className="count-display">
          {count} <span className="total-count">/ {students.length}</span>
        </h1>

        <div className="btn-group">
          <button
            className="btn btn-increase"
            onClick={increaseCount}
            disabled={count === students.length}
          >
            Increase
          </button>
          <button
            className="btn btn-decrease"
            onClick={decreaseCount}
            disabled={count === 0}
          >
            Decrease
          </button>
          <button
            className="btn btn-reset"
            onClick={resetCount}
            disabled={count === 0}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="student-grid">
        {students.slice(0, count).map((student) => (
          <StudentInfo
            key={student.rollNo}
            rollNo={student.rollNo}
            name={student.name}
            course={student.course}
            semester={student.semester}
            grade={student.grade}
            email={student.email}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
