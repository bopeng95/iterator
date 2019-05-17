const app = require('express')();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/authRoute');
const dbRoute = require('./routes/dbRoute');

const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/db', dbRoute);

module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
