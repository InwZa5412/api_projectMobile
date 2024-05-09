const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
require('dotenv').config()
const app = express()
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const saltPounds = 10;
const secret = 'Venom-Toxin-2024'

app.use(cors())
app.use(express.json())

const connection = mysql.createConnection(process.env.DATABASE_URL)

app.get('/', (req, res) => {
    res.send('Hello world!!')
})

app.get('/users', (req, res) => {
    connection.query(
        'SELECT * FROM users',
        function (err, results, fields) {
            res.send(results)
        }
    )
})

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT * FROM users WHERE id = ?', [id],
        function (err, results, fields) {
            res.send(results)
        }
    )
})

app.post('/users/login',jsonParser, function(req, res, next){
    connection.execute(
    'SELECT * FROM users WHERE username=?',
    [req.body.username],
    function(err,users,fields){
        if(err){res.json({status:'error',message: err}); return}
        if(users.length ==0){res.json({status:'error',message: 'no user found'}); return}
        
        bcrypt.compare(req.body.password, users[0].password, function(err, isLogin){
            if(isLogin){
                var token = jwt.sign({username: users[0].username}, secret);
                res.json({status: 'ok', message: 'login success'}, token)
            } else{
                res.json({status: 'error', message: 'login failed'})
            }

        });
    }
    );

})

app.post('/users/register',jsonParser, (req, res, next) => {
   bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    connection.execute(
        'INSERT INTO users (username,password,fname,lname,avatar) VALUES (?,?,?,?,?)'
        [req.body.username,req.body.password,req.body.fname,req.body.lname,req.body.avatar],
        function(err, results, fields){
            if(err){
                res.json({status: 'error',message: err})
                return
            }
            res.json({status: 'ok'})
        }
    );
   })
})

app.put('/users/update', (req, res) => {
    connection.query(
        'UPDATE `users` SET `fname`=?, `lname`=?, `username`=?, `password`=?, `avatar`=? WHERE id =?',
        [req.body.fname, req.body.lname, req.body.username, req.body.password, req.body.avatar, req.body.id],
         function (err, results, fields) {
            res.send(results)
        }
    )
})

app.delete('/users/delete', (req, res) => {
    connection.query(
        'DELETE FROM `users` WHERE id =?',
        [req.body.id],
         function (err, results, fields) {
            res.send(results)
        }
    )
})

app.listen(process.env.PORT || 3000, () => {
    console.log('CORS-enabled web server listening on port 3000')
})
