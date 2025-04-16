// app.js
import express from 'express';
const app = express();

import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';

app.use(session({
    name: 'QuackMatchSession',
    secret: 'someSuperSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // To serve CSS/JS

// View engine setup
const hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        eq: (a, b) => a === b,
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => b !== 0 ? a / b : 0
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Load routes AFTER view engine is set
configRoutes(app);

// Start server
app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});
