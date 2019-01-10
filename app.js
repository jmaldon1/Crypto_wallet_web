const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const configRoutes = require("./routes/index");
var path = require('path');

/* Sets my static folder to /public */
app.use('/public', express.static(__dirname + '/public'));

/* Allows me to use .html extension on my views */
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

configRoutes(app);

app.listen(5000, () => {
	console.log("We've now got a server!");
	console.log("Your routes will be running on http://localhost:5000");
});