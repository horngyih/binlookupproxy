const app = require("./app");

var port = process.env.PORT || '9801';

app.listen(port, function(){
    console.log( "Listening to ", port );
});