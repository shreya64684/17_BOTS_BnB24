const mysql2 = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const connection = mysql2.createConnection({
//     host: '127.0.0.1',   // Your MySQL server host
//     user: 'root',
//     password: '',
//     database: process.env.DATABASE,
//   });
  
//   connection.connect((err) => {
//     if (err) {
//       console.error('Error connecting to MySQL:', err.stack);
//       return;
//     }
//     console.log('Connected to MySQL');
  
//   });

exports.register = (req, res) => {
    console.log(req.body);

    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const usertype = req.body.usertype;

    connection.query('SELECT Username FROM users WHERE Username = ?' , [username],async (error,results) => {
        if (error) {
            console.error('Error fetching classes:', err);
            
          } 

          if (results.length > 0) {
            return res.render('register' , {
                message: 'The message is already in use.'
            });
          }

          let hashedPassword = await bcrypt.hash(password,8);
          console.log(hashedPassword);
    })

    connection.query('INSERT INTO users SET ?', {name: name, Username: username , Password : password, Usertype: usertype} , (error, results) => {
        if(error){
            console.log(error);
        }
        else {
            console.log(results);
            res.json(results);
        }

    });

    // res.send("Form submitted");
}
