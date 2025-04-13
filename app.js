//Here is where you'll set up your server as shown in lecture code
import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';

app.use(express.json());
app.use(express.urlencoded({extended: true}));

configRoutes(app);

const hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        eq: (a, b) => a === b
      }});


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');  



app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});