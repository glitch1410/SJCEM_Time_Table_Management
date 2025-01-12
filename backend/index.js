// backend/index.js
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const HOST = '0.0.0.0'

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Login Endpoint
app.post('/login', async (req, res) => {
	const { username, password } = req.body;
  
	try {
	  const userQuery = 'SELECT * FROM Users WHERE username = $1 AND password = $2';
	  const result = await pool.query(userQuery, [username, password]);
  
	  if (result.rows.length > 0) {
		const user = result.rows[0];
  
		// Create a JWT payload with the user's role and username
		const payload = {
		  role: user.role,
		  username: user.username,
		  department: user.department, // Assuming department exists in Users table
		  semester: user.current_semester,     // Assuming semester exists in Users table
		  division: user.division      // Assuming division exists in Users table
		};
  
		// Generate JWT token
		const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  
		// Respond with the token, role, and user details
		const userDetails = {
		  role: user.role,
		  username: user.username,
		  department: user.department,
		  semester: user.current_semester,
		  division: user.division,

		};
  
		if (user.role === 'faculty' && user.is_timetable_coordinator) {
		  res.json({ token, role: 'timetable_coordinator', userDetails });
		} else {
		  res.json({ token, role: user.role, userDetails });
		}
	  } else {
		res.status(401).json({ message: 'Invalid credentials' });
	  }
	} catch (err) {
	  console.error('Server error:', err.message);
	  res.status(500).json({ message: 'Server error' });
	}
  });

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.sendStatus(403); // Forbidden if no token

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// Example protected route (admin dashboard)
app.get('/admin-dashboard', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    res.json({ message: 'Welcome to the Admin Dashboard' });
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});

const port = process.env.PORT || 5000 || '0.0.0.0';
app.listen(port, HOST, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/generate-timetable', (req, res) => {
    exec('python generating.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(`Stdout: ${stdout}`);
        res.status(200).json({ message: 'Script executed successfully', output: stdout });
    });
});

app.get('/api/timetable', (req, res) => {
    const filePath = path.join(__dirname, '/timetables.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            res.status(500).send('Error reading the timetable data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// GET - Fetch all messages
app.get('/messages', async (req, res) => {
	try {
	  const result = await pool.query('SELECT * FROM messages ORDER BY timestamp DESC');
	  res.status(200).json(result.rows);
	} catch (err) {
	  console.error(err.message);
	  res.status(500).send('Server error');
	}
  });

  // POST - Send a message
app.post('/messages', async (req, res) => {
	const { sender, content } = req.body;
  
	try {
	  const result = await pool.query(
		'INSERT INTO messages (sender, content) VALUES ($1, $2) RETURNING *',
		[sender, content]
	  );
	  res.status(201).json(result.rows[0]);
	} catch (err) {
	  console.error(err.message);
	  res.status(500).send('Server error');
	}
  });
  
// DELETE - Delete a message
app.delete('/messages/:id', async (req, res) => {
const { id } = req.params;

try {
	await pool.query('DELETE FROM messages WHERE message_id = $1', [id]);
	res.status(200).send(`Message with ID ${id} deleted.`);
} catch (err) {
	console.error(err.message);
	res.status(500).send('Server error');
}
});

// backend/index.js

// POST - Create a new user
app.post('/users', async (req, res) => {
    const { username, password, role, department, division, current_semester, is_timetable_coordinator } = req.body;

    try {
        const query = `
            INSERT INTO Users (username, password, role, department, division, current_semester, is_timetable_coordinator) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`;
        const result = await pool.query(query, [username, password, role, department, division, current_semester, is_timetable_coordinator]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// GET - Fetch all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Users ORDER BY username ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// PUT - Update a user
app.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const { password, role, department, division, current_semester, is_timetable_coordinator } = req.body;

    try {
        const query = `
            UPDATE Users SET 
                password = $1, 
                role = $2, 
                department = $3, 
                division = $4, 
                current_semester = $5, 
                is_timetable_coordinator = $6
            WHERE username = $7 
            RETURNING *`;
        const result = await pool.query(query, [password, role, department, division, current_semester, is_timetable_coordinator, username]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE - Delete a user
app.delete('/users/:username', async (req, res) => {
    const { username } = req.params;

    try {
        await pool.query('DELETE FROM Users WHERE username = $1', [username]);
        res.status(200).send(`User ${username} deleted.`);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});


  
module.exports = app;