const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const port = 4000;
const dotenv = require("dotenv");
dotenv.config({ path: './.env'});
require("dotenv").config();
const path = require("path");
const crypto = require('crypto');
const router = express.Router();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const mysql2 = require('mysql2');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// const connection = mysql2.createConnection({
//   host: '127.0.0.1',   // Your MySQL server host
//   user: 'root',
//   password: '',
//   database:'telehealth',
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err.stack);
//     return;
//   }
//   console.log('Connected to MySQL');

// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login/main.html');
});

app.get('/admin_login', (req, res) => {
  res.sendFile(__dirname + '/admin/admin_login.html');
})

app.get('/admin_register', (req, res) => {
  res.sendFile(__dirname + '/admin/admin_register.html');
})

app.get('/doctor_login', (req, res) => {
  res.sendFile(__dirname + '/doctor/doctor_login.html');
})

app.get('/doctor_profile', (req, res) => {
  res.sendFile(__dirname + '/doctor/doctor_profile.html');
})

app.get('/doctor_register', (req, res) => {
  res.sendFile(__dirname + '/doctor/doctor_register.html');
})

app.get('/doctor_appointment', (req, res) => {
  res.sendFile(__dirname + '/doctor/doctor_appointment.html');
})

app.get('/user_login', (req, res) => {
  res.sendFile(__dirname + '/user/user_login.html');
})

app.get('/auth/userRegister', (req, res) => {
  res.sendFile(__dirname + '/views/register.html');
})

app.get('/user_dashboard', (req, res) => {
  res.sendFile(__dirname + '/user/user_dashboard.html');
})

app.get('/user_profile', (req, res) => {
  res.sendFile(__dirname + '/user/user_profile.html');
})

app.get('/booked_appointment', (req, res) => {
  res.sendFile(__dirname + '/user/booked_appointments.html');
})

app.get('/new_appointment', (req, res) => {
  res.sendFile(__dirname + '/user/new_appointments.html');
})

app.get('/suggested_packages', (req, res) => {
  res.sendFile(__dirname + '/user/suggested_packages.html');
})
app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/user/chat.html');
})
app.use('/auth' , require('./routes/auth'));



app.post('/register', (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password ;
  const usertype = req.body.usertype ; 
  console.log(username);

  // Insert user data into the database
  connection.query('INSERT INTO users (name , username, password, userType) VALUES (? ,?, ?, ?)', [name ,username, password, usertype], (error, results) => {
      if (error) {
          console.error('Error inserting user:', error);
          res.status(500).send('Error registering user');
          return;
      }
      res.redirect('/user_login.html');
      console.log(results);
      console.log('User registered successfully');
      res.status(200).send('User registered successfully');
  });
});

app.post('/user_login', (req, res) => {
  const { username, password } = req.body;

  // Query the database to find the user
  // Assuming you're using a database client like mysql2
  connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
      if (error) {
          console.error(error);
          return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
          // User not found
          return res.status(401).send('Invalid username or password');
      }

      const user = results[0];
      console.log(user);
      // Compare passwords
      bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Internal Server Error');
          }
          if (!result) {
              // Passwords don't match
              return res.status(401).send('Invalid username or password');
          }
          // Passwords match, create session or token
          req.session.userId = user.id; // Example of session creation
          res.redirect('/user_profile');
      });
  });
});





app.get('/fetchTestStatus', (req, res) => {
  //Replace this with your database query to fetch test statuses
  // connection.query('SELECT id, name FROM status', (err, rows) => {
  //   if (err) {
  //     console.error('Error fetching test statuses:', err);
  //     res.status(500).json({ error: 'Error fetching test statuses' });
  //   } else {
  //     res.json({ testStatuses: rows });
  //   }
  // });

  // 
  connection.query('SELECT id, name FROM status', (err, results) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching test statuses' });
    }

    const testStatuses = results; // Assuming the results directly contain the ID and name
    testStatuses.forEach(status => {
      // console.log(`Status ID: ${status.id}, Name: ${status.name}`);
  });
    res.json({ testStatuses });
});

});

app.get('/fetchClasses', (req, res) => {
  // Replace this with your database query to fetch classes
  connection.query('SELECT id, name FROM classes', (err, rows) => {
    if (err) {
      console.error('Error fetching classes:', err);
      res.status(500).json({ error: 'Error fetching classes' });
    } else {
      res.json({ classes: rows });
    }
  });
});


app.get('/getTests', (req, res) => {
  const user_id = 1; // Assuming you have the teacher's user ID in the session

  // Query to fetch test data for a specific teacher
  const sql = `
    SELECT id, name, subject, date
    FROM tests
    WHERE teacher_id = ?
      AND status_id IN (1, 2)
  `;

  connection.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching test data: ' + err);
      res.status(500).json({ error: 'Error fetching test data' });
    } else {
      res.json(results);
    }
  });
});

// Define a route to fetch test details by test ID
app.get('/api/getTestDetails/:testId', (req, res) => {
  const testId = req.params.testId;
  console.log(testId);
  // const testId = 3;
  // Query the database to fetch test details
  const sql = 'SELECT name, subject, date, total_questions FROM tests WHERE id = ?';
  connection.query(sql, [testId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Error fetching test details' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Test not found' });
    } else {
      // Assuming the database query was successful
      const testDetails = results[0];
      res.json(testDetails);
    }
  });
});

app.get('/fetch-questions/:testId', (req, res) => {
  const testId = req.params.testId;
  console.log(testId);
  // Assuming you have a database connection

  const sql = `SELECT questions.* FROM questions
              INNER JOIN question_test_mapping ON questions.id = question_test_mapping.question_id
              WHERE question_test_mapping.test_id = ?`;

  connection.query(sql, [testId], (err, results) => {
      if (err) {
          console.error('Error fetching questions:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});

app.use("/public", express.static("public"));

const sessionStoreOptions = {
  host: '127.0.0.1',
  port: 3306, // Default MySQL port
  user: 'root',
  password: '',
  database: 'quizz', // The name of your database
};

const sessionOptions = {
  secret: 'your-secret-key', // Change this to a secure secret
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore(sessionStoreOptions),
};

app.use(session(sessionOptions));

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log()
  const enc_password = crypto.createHash('sha256').update(password).digest('hex');

  const sql = 'SELECT * FROM teachers WHERE email = ? AND password = ?';

  connection.execute(sql, [username, enc_password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Database error' });
    } else if (results.length === 1) {
      // res.status(200).json({ message: 'success' });
      req.session.teacher_id = results[0].id;
      console.log(req.session.teacher_id);
      res.redirect('/teacher_dashboard.html');
      // Initialize the session if login is successful
      // req.session.user_id = results[0].id;
    } else {
      res.status(200).json({ message: 'fail' });
    }
  });
  
});

app.get('/teacher_dashboard', (req, res) => {
  const teacher_id = req.session.teacher_id;
  console.log(teacher_id);
  // Use teacher_id to fetch teacher-specific data from your database

  // Example: Fetch teacher data using teacher_id
  const sql = 'SELECT * FROM teachers WHERE id = ?';
  connection.execute(sql, [teacher_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 1) {
      const teacherData = results[0];
      // Send the teacherData to the teacher dashboard template
      // res.render('teacher_dashboard', { teacherData });
    } else {
      return res.status(404).json({ message: 'Teacher not found' });
    }
  });
});



app.post('/student_login', (req, res) => {
  const student_roll_number = req.body.rollNumber;
  const student_password = req.body.studentpassword;

  const sql1 = `SELECT id FROM student_data WHERE rollno = ?`;
  connection.execute(sql1, [student_roll_number], (err, results1) => {
    if (err) {
      console.error('Error querying student_data:', err);
      res.status(500).json({ message: 'Database error' });
      return;
    }
    if (results1.length > 0) {
      const student_id = results1[0].id;

      const sql2 = `SELECT id, test_id, rollno, score, status FROM students WHERE rollno = ? AND password = ? AND status = 0`;
      connection.execute(sql2, [student_id, student_password], (err, results2) => {
        if (err) {
          console.error('Error querying students:', err);
          res.status(500).json({ message: 'Database error' });
          return;
        }

        if (results2.length > 0) {
          const info = results2;
          res.redirect('/student_dashboard.html');
        } else {
          res.status(200).json({ message: 'STUDENT_RECORD_NOT_FOUND' });
        }
      });
    } else {
      res.status(200).json({ message: 'STUDENT_RECORD_NOT_FOUND' });
    }
  });
});



app.post('/add_data', (req, res) => {
  const className = req.body.class_name;
  const startingRollNumber = req.body.starting_roll_number;
  const endingRollNumber = req.body.ending_roll_number;

  // Insert class data into the 'classes' table
  const sql = `INSERT INTO classes (name) VALUES (?)`;
  connection.query(sql, [className], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error creating class');
    }

    const classId = result.insertId;

    // Insert student data into the 'student_data' table
    for (let rollNumber = startingRollNumber; rollNumber <= endingRollNumber; rollNumber++) {
      const studentSql = 'INSERT INTO student_data (rollno, class_id) VALUES (?, ?)';
      connection.query(studentSql, [rollNumber, classId], (studentErr) => {
        if (studentErr) {
          console.error(studentErr);
          return res.status(500).send('Error creating students');
        }
      });
    }

    return res.status(200).send('Class and students added successfully');
  });
});

const http = require('http');

const socketIo = require('socket.io');


const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
  console.log('New client connected');

  socket.on('joinRoom', roomId => {
    socket.join(roomId);
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    io.to(roomId).emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



app.listen(port, () => {
  console.log('Server is running on port: ' + port);
});