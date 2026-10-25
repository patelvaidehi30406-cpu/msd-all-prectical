import { useState } from 'react';
import './App.css';

const INITIAL_STUDENTS = [
  {
    id: 1,
    name: 'Aarav Sharma',
    rollNo: '2026BCA101',
    email: 'aarav.sharma@college.edu',
    phone: '9876543210',
    course: 'BCA',
    semester: 'Semester 4',
    cgpa: '8.9',
    joinedDate: '24 Oct 2026',
  },
  {
    id: 2,
    name: 'Priya Patel',
    rollNo: '2026BSC204',
    email: 'priya.patel@college.edu',
    phone: '9123456789',
    course: 'B.Sc. CA & IT',
    semester: 'Semester 6',
    cgpa: '9.4',
    joinedDate: '24 Oct 2026',
  },
];

function App() {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [cgpa, setCgpa] = useState('');

  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');

    if (
      !name.trim() ||
      !rollNo.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !course ||
      !semester
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (cgpa && (isNaN(cgpa) || Number(cgpa) < 0 || Number(cgpa) > 10)) {
      setError('CGPA must be a number between 0 and 10.');
      return;
    }

    if (
      students.some(
        (s) => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase()
      )
    ) {
      setError('A student with this Enrollment / Roll No. already exists.');
      return;
    }

    const newStudent = {
      id: Date.now(),
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      course,
      semester,
      cgpa: cgpa ? Number(cgpa).toFixed(1) : 'N/A',
      joinedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setStudents([newStudent, ...students]);

    setName('');
    setRollNo('');
    setEmail('');
    setPhone('');
    setCourse('');
    setSemester('');
    setCgpa('');
    setError('');
    setSuccess(`Student "${newStudent.name}" registered successfully!`);

    setTimeout(() => setSuccess(''), 4000);
  }

  function handleDelete(id) {
    setStudents(students.filter((student) => student.id !== id));
  }

  function handleResetForm() {
    setName('');
    setRollNo('');
    setEmail('');
    setPhone('');
    setCourse('');
    setSemester('');
    setCgpa('');
    setError('');
    setSuccess('');
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      filterCourse === 'All' || student.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const uniqueCourses = new Set(students.map((s) => s.course)).size;
  const validCgpas = students
    .map((s) => parseFloat(s.cgpa))
    .filter((val) => !isNaN(val));
  const avgCgpa =
    validCgpas.length > 0
      ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2)
      : '0.00';

  return (
    <div className="app-wrapper">
      <div className="app">
        {/* Header Banner */}
        <header className="app-header">
          <div className="badge">MSD Practical 3</div>
          <h1>Student Management System</h1>
          <p className="subtitle">
            React Forms, Controlled Components &amp; Real-Time Input Validation
          </p>

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{students.length}</span>
              <span className="stat-label">Total Students</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{uniqueCourses}</span>
              <span className="stat-label">Active Courses</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{avgCgpa}</span>
              <span className="stat-label">Average CGPA</span>
            </div>
          </div>
        </header>

        <div className="main-content">
          {/* Registration Form Card */}
          <section className="form-section">
            <div className="section-title">
              <h2>Register New Student</h2>
              <p>Enter academic and contact details below</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Verma"
                  />
                </div>

                <div className="form-group">
                  <label>Enrollment / Roll No. *</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 2026BCA105"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="form-group">
                  <label>Course *</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    <option value="B.Sc. CA & IT">B.Sc. CA &amp; IT</option>
                    <option value="BCA">BCA</option>
                    <option value="B.Tech">B.Tech (CSE / IT)</option>
                    <option value="MCA">MCA</option>
                    <option value="M.Sc. IT">M.Sc. IT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Current CGPA (Optional, 0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              {error && <div className="alert error">{error}</div>}
              {success && <div className="alert success">{success}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  + Add Student
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetForm}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          {/* Student Directory Section */}
          <section className="list-section">
            <div className="list-header">
              <div>
                <h2>Student Directory ({filteredStudents.length})</h2>
                <p>View, search, and manage registered student records</p>
              </div>

              <div className="filter-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, roll no, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <option value="All">All Courses</option>
                  <option value="B.Sc. CA & IT">B.Sc. CA &amp; IT</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Sc. IT">M.Sc. IT</option>
                </select>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎓</div>
                <h3>No student records found</h3>
                <p>
                  {students.length === 0
                    ? 'No students added yet. Use the form on the left to register your first student.'
                    : 'No students match your current search or course filter.'}
                </p>
              </div>
            ) : (
              <div className="student-grid">
                {filteredStudents.map((student) => (
                  <div className="student-card" key={student.id}>
                    <div className="card-top">
                      <div className="avatar">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-title">
                        <h3>{student.name}</h3>
                        <span className="roll-badge">{student.rollNo}</span>
                      </div>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(student.id)}
                        title="Remove Student"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="card-tags">
                      <span className="tag course-tag">{student.course}</span>
                      <span className="tag sem-tag">{student.semester}</span>
                      {student.cgpa !== 'N/A' && (
                        <span className="tag cgpa-tag">
                          CGPA: {student.cgpa}
                        </span>
                      )}
                    </div>

                    <div className="card-details">
                      <p>
                        <strong>Email:</strong> {student.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> +91 {student.phone}
                      </p>
                      <p>
                        <strong>Registered:</strong> {student.joinedDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
