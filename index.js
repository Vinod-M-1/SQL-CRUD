require("dotenv").config();
const { faker } = require("@faker-js/faker");         //CREATE FAKE DATA
const mysql = require("mysql2");                      //BUILDS CONNECTION WITH DATABASE ON LOCAL HOST USING CONNECTION OBJECTS WHICH HAS METHODS LIKE QUERY TO TALK TO DB
const express = require("express");                   //THIS IS OUR MAIN BACKEND creating a web server
const app = express();
const path = require("path");
const methodOverride = require("method-override");    //SUPPORTS METHODS FOR FORMS IN EJS FILES OR FORMS  
  
app.use(methodOverride("_method"));                   //changes request method internally.
app.use(express.urlencoded({extended: true}));        //Parses form data. Without this: req.body === undefined
app.set("view engine", "ejs");                        //Tells Express: res.render("file") look for file.ejs and convert it to html
app.set("views", path.join(__dirname, "/views"));     //EXpress knows where to find ejs files throgh this

  //BUILDING A CONNECTION OBJECT
  // const connection = mysql.createConnection({       
  //   host: 'localhost',
  //   user: 'root',
  //   database: 'test',
  //   password: '2006'
  // });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

//Home route
  app.get("/", (req, res)=>{
      let q = "SELECT COUNT(*) FROM user";
      connection.query(q, (err, result) => {
        if(err){
            console.log(err);
            return res.send("Some error in database..");
        }

        let count  = result[0]["COUNT(*)"];
        res.render("home", {count});
    });
  });


  //USER ROUTE
  app.get("/users", (req,res)=>{
      let q = "select * from user;";
        connection.query(q, (err, users) => {
          if(err){
            console.log(err);
            return res.send("Some error in the database");
          }
          res.render("user.ejs", {users});
        })
  });


//EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if(err){
      console.log(err);
      return res.send("Some error in the database");  
    }
    let user = result[0];
    res.render("edit.ejs", {user});
    console.log(result);
    })
})

//UPDATE ROUTE
app.patch("/user/:id", (req,res) => {
  let { id } = req.params;
  let {password: formPass, username: newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q,[id], (err, result) => {
    if(err){
      console.log(err);
      return res.send("Some error in the database..");
    }
    if(formPass != result[0]["password"]){
        res.send("Incorrect password");
    }else{
        let q2 = "UPDATE user SET username = ? WHERE id=?";
        connection.query(q2,[newUsername, id] ,(err,result) => {
        if(err){
          console.log(err);
          return res.send("Some error in database..");
        }
        res.redirect("/users");
    })
  }});
})

app.get("/add", (req,res) => {
  res.render("add.ejs");
})


//post request
app.post("/users", (req,res) => {
  let {id,username,email,password} = req.body;
    let q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
    connection.query(q,[id,username,email,password], (err, result) => {
    if(err){
      console.log(err);
      return res.send("Some error in database");
    }
    res.redirect("/users");
  })
})


//DELETE USER
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if(err){
      console.log(err);
      return res.send("Some error in the database");  
    }
    let user = result[0];
    res.render("delete.ejs", {user});
    })
})

app.delete("/users/:id", (req,res) => {
  let {id} = req.params;
  let {email, password} = req.body;
  let q = `SELECT * FROM user WHERE id = ?`
  connection.query(q,[id], (err,result) => {
    if(result[0]["password"] != password || result[0]["email"] != email){
      res.send("invalid credentials");
    }else{
      let q2 = 'DELETE FROM user WHERE id = ?';
      connection.query(q2,[id], (err,result) => {
        if(err){
          console.log(err);
          return res.send("Some error in the database");
        }else{
          res.redirect("/users");
        }
      })
    }
  })
})

// app.listen(8080, ()=>{
//     console.log("server listening to port 8080..");
// })


const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
  console.log("server listening");
});



  //INSERT IN BULK
  // let q = "INSERT INTO user(id, username, email, password) VALUES ?";
  // let data = [];
  // for(let i = 0; i<100; i++){
  //     data.push(getRandomUser());
  // }
  // try{
  //     connection.query(q, [data], (err, result) => {
  //         if(err) throw err;
  //         console.log(result);
  //     })
  // } catch(err){
  //     console.log(err);
  // }
  // let  getRandomUser = ()=>{
  //   return [
  //     faker.string.uuid(),
  //     faker.internet.username(),
  //     faker.internet.email(),
  //     faker.internet.password(),
  //   ];
  // }
  // connection.end();


