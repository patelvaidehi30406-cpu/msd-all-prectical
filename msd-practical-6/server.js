const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let students = [
  { id: 1, name: 'Vaidehi', course: 'B.Sc. CA & IT' },
  { id: 2, name: 'Riya', course: 'BCA' }
];

let nextId = 3;

// Home route
app.get('/', (req, res) => {
  res.send('Practical 6: Student Records REST API is running!');
});

// GET: Fetch all students
app.get('/api/students', (req, res) => {
  res.status(200).json(students);
});

// GET: Fetch student by ID
app.get('/api/students/:id', (req, res) => {
  const student = students.find(
    s => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.status(200).json(student);
});

// POST: Add a new student
app.post('/api/students', (req, res) => {
  const { name, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({
      message: 'Name and course are required'
    });
  }

  const student = { id: nextId++, name, course };
  students.push(student);

  res.status(201).json({
    message: 'Student added successfully',
    student
  });
});

// PUT: Update a student
app.put('/api/students/:id', (req, res) => {
  const student = students.find(
    s => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { name, course } = req.body;

  if (name) student.name = name;
  if (course) student.course = course;

  res.status(200).json({
    message: 'Student updated successfully',
    student
  });
});

// DELETE: Remove a student
app.delete('/api/students/:id', (req, res) => {
  const index = students.findIndex(
    s => s.id === Number(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const deletedStudent = students.splice(index, 1)[0];

  res.status(200).json({
    message: 'Student deleted successfully',
    student: deletedStudent
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
