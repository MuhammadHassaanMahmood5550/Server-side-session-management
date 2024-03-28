const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

// Note: we will achieve session base authentication and authorization,
// step1: user signUp // new user will be added to the hardcode database nothing else is done.
// step2: user signIn // user signIn with their email and pass and a new session will create when we add his/her name to session 
//   because saveUninitialized: false,(only create new session when session update). and this session unique id 
// will be stored in client browser using cookie-parser and withCredientials: true on client side using axios. 
// step 3: /api/users // this is a protected route or this step where authorization accur user sent request from client with 
// saved session on client browser's cookie and the express-session middleware check if session id is corrent 
// it will bring that perticular saved session. if session id is wrong/changed from clinet express-session middleware 
// checks it and wont bring anything.
// step 4: logout     // that perticular session destroyed.


//--middlewares
app.use(express.json()); //parse incomming json data to js object
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(cookieParser()); //enable server to save, read and access cookie
app.use(session({
    secret: "my-secret-key",
    resave: false, //do not resave on every request
    saveUninitialized: false, //save only when session updates(i.e we update session on user login) not when user visit website only,
    cookie: { maxAge: 1000 * 60 * 2 } //here 1sec = 1000 milisec, 1000 * 60 = 1 minute 
}));

let users = [];

app.post("/api/signUp", (req, res) => {
    const { name, email, password } = req.body;
    users.push({ name: name, email: email, password: password });
    res.status(201).json({ message: "User successfully created!" });
});

app.post("/api/signIn", (req, res) => {
    const { email, password } = req.body;
    const user = users.find((cur) => cur.password === password);
    if (user) {
        let session = req.session;
        console.log("session b", session);
        session.userName = user.name;
        console.log("session a", session);
        res.status(201).json({ message: "User successfully authenticated!" });
    } else {
        return res.status(404).json({ message: "user not found" });
    }
});

app.get("/api/users", (req, res) => {
    console.log("req.session", req.session, "sessionID", req.sessionID);
    if (req.session.userName) {
        res.status(200).json({ message: "success", users: users });
    } else {
        res.status(401).json({ message: "Unauthenticated" });
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});


app.listen(4000, () => {
    console.log("Server is running on port 4000");
})