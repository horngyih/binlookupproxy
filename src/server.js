const app = require("./app");

var port = process.env.port || '9801';

app.listen(port, function(){
    console.log( "Listening to ", port );
});