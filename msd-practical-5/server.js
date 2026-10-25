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
  res.send('Practical 5: Express.js CRUD Server is running!');
});

// Read all students
app.get('/students', (req, res) => {
  res.json(students);
});

// Read one student
app.get('/students/:id', (req, res) => {
  const student = students.find(
    s => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
});

// Create student
app.post('/students', (req, res) => {
  const { name, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({
      message: 'Name and course are required'
    });
  }

  const student = { id: nextId++, name, course };
  students.push(student);

  res.status(201).json({
    message: 'Student created',
    student
  });
});

// Update student
app.put('/students/:id', (req, res) => {
  const student = students.find(
    s => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { name, course } = req.body;

  if (name) student.name = name;
  if (course) student.course = course;

  res.json({ message: 'Student updated', student });
});

// Delete student
app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(
    s => s.id === Number(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const deletedStudent = students.splice(index, 1)[0];

  res.json({
    message: 'Student deleted',
    student: deletedStudent
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
