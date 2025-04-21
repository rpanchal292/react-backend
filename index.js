const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=> {
    res.send('App Is running');
});

app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    try {
           // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // 2. Hash the password
     const saltRounds = 10; // standard is 10
     const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = new User({ name, email, hashedPassword });
      await user.save();
      res.status(201).json({ message: "User Registered Successfully" });
    } catch (err) {
      console.error(err); // Log the real error
      if (err.code === 11000) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(400).json({ error: "Error creating user" });
    }
  });

  
app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ error: "Invalid Email or Password" });
      }
  
      // 2. Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid Email or Password" });
      }
  
      // 3. If valid → send success
      res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server Error" });
    }
  });

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})