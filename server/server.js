require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const routes = require('./routes.js');
const cors = require('cors');

app.use(cors({
    origin: 'https://limcai21.github.io'
}));
app.use('/',routes);
app.use(express.static('views'));
app.use(express.json());
app.listen(port, function () {
    console.log('Server started on port ' + port);
});
