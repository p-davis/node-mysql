var express = require('express')
var app = express()
 
// SHOW LIST OF USERS
app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM members ORDER BY id DESC',function(err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('user/list', {
                    title: 'User List', 
                    data: ''
                })
            } else {
                // render to views/user/list.ejs template file
                res.render('user/list', {
                    title: 'User List', 
                    data: rows
                })
            }
        })
    })
})
 
// SHOW ADD USER FORM
app.get('/add', function(req, res, next){    
    // render to views/user/add.ejs
    res.render('user/add', {
        title: 'Add New User',
        username: '',
        email: '',
        password: ''        
    })
})
 
// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){    
    req.assert('username', 'Username is required').notEmpty()           //Validate name
    req.assert('email', 'Email is required').isEmail();             //Validate age
    req.assert('password', '').notEmpty()  //Validate email
 
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!

        var user = {
            username: req.sanitize('username').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            password: req.sanitize('password').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO members SET ?', user, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('user/add', {
                        title: 'Add New User',
                        username: user.username,
                        email: user.email,
                        password: user.password                    
                    })
                } else {                
                    req.flash('success', 'Data added successfully!')
                    
                    // render to views/user/add.ejs
                    res.render('user/add', {
                        title: 'Add New User',
                        username: '',
                        email: '',
                        password: ''                    
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })                
        req.flash('error', error_msg)        
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('user/add', { 
            title: 'Add New User',
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
    }
})
 
// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM members WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err           
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'User not found with id = ' + req.params.id)
                res.redirect('/users')
            }
            else { // if user found
                // render to views/user/edit.ejs template file
                res.render('user/edit', {
                    title: 'Edit User', 
                    //data: rows[0],
                    id: rows[0].id,
                    username: rows[0].username,
                    email: rows[0].email,
                    password: rows[0].password                    
                })
            }            
        })
    })
})
 
// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
    req.assert('username', 'username is required').notEmpty()           //Validate name
    req.assert('email', 'A valid email is required').isEmail()  //Validate email
    req.assert('password', 'Password is required').notEmpty()             //Validate password
 
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!

        var user = {
            username: req.sanitize('name').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            password: req.sanitize('password').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE members SET ? WHERE id = ' + req.params.id, user, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('user/edit', {
                        title: 'Edit User',
                        id: req.params.id,
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password
                    })
                } else {
                    req.flash('success', 'Data updated successfully!')
                    
                    // render to views/user/add.ejs
                    res.render('user/edit', {
                        title: 'Edit User',
                        id: req.params.id,
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('user/edit', { 
            title: 'Edit User',            
            id: req.params.id, 
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
    }
})
 
// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
    var user = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM members WHERE id = ' + req.params.id, user, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                // redirect to users list page
                res.redirect('/users')
            } else {
                req.flash('success', 'User deleted successfully! id = ' + req.params.id)
                // redirect to users list page
                res.redirect('/users')
            }
        })
    })
})
 
module.exports = app