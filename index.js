const path = require('path');

const http = require('http');
const express = require('express');
const session = require('express-session');

const db = require('./database');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: '3x@mp13K3y',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (request, response) => {
    response.render(__dirname + '/views/main.ejs', { option: 1 });
});

app.post('/register', async (request, response) => {
    const { username, email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    db.run(query, [username, email, hashedPassword], function(err) {
        if (err) {
            console.error(err.message);
            return response.status(400).send('User already exists');
        }
        response.redirect('/');
    });
});

app.post('/login', (request, response) => {
    const { username, password } = request.body;

    // For an SQL injection example later
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    db.get(query, async (error, user) => {
        if (error) {
            console.error(error.message);
            return response.status(500).send('Internal Server Error');
        }
        if (user && await bcrypt.compare(password, user.password)) {
            request.session.user = user;
            return response.redirect('/chat');
        }
        response.status(400).send('Invalid username or password');
    });
});

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/');
    }
}

app.get('/chat', requireAuth, (request, response) => {
    response.render(__dirname + '/views/chat.ejs', { ...request.session.user });
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log(msg);
        io.emit('chat message', msg);
    });
});

server.listen(PORT, () => {
    console.log(`>> Server started on port ${PORT}`);
});