const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Store fallback metadata inside uploads/.local_db.json (ignored by git)
const dbFilePath = path.join(__dirname, '..', 'uploads', '.local_db.json');

const readDB = () => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      return { users: [], documents: [] };
    }
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], documents: [] };
  }
};

const writeDB = (data) => {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

const generateId = () => crypto.randomBytes(12).toString('hex');

const localUserStore = {
  async findOneByEmail(email) {
    const db = readDB();
    return db.users.find((u) => u.email === email.toLowerCase()) || null;
  },

  async findById(id) {
    const db = readDB();
    const user = db.users.find((u) => u._id === String(id));
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, password }) {
    const db = readDB();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  },

  async matchPassword(enteredPassword, hashedPassword) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  },
};

const localDocumentStore = {
  async create({ filename, originalName, fileType, fileSize, uploadDate, owner }) {
    const db = readDB();
    const newDoc = {
      _id: generateId(),
      filename,
      originalName,
      fileType,
      fileSize,
      uploadDate: (uploadDate || new Date()).toISOString(),
      owner: String(owner),
      createdAt: new Date().toISOString(),
    };
    db.documents.push(newDoc);
    writeDB(db);
    return newDoc;
  },

  async findByOwner(ownerId) {
    const db = readDB();
    return db.documents
      .filter((doc) => String(doc.owner) === String(ownerId))
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  },

  async findOneByIdAndOwner(id, ownerId) {
    const db = readDB();
    return (
      db.documents.find(
        (doc) => String(doc._id) === String(id) && String(doc.owner) === String(ownerId)
      ) || null
    );
  },

  async deleteById(id) {
    const db = readDB();
    db.documents = db.documents.filter((doc) => String(doc._id) !== String(id));
    writeDB(db);
  },
};

module.exports = {
  localUserStore,
  localDocumentStore,
};
