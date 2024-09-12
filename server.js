const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userdb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    let pass = await User.findOne({ password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (!pass) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
  

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the user
    user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));