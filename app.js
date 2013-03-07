
/**
 * Module dependencies.
 */

var express = require('express')
        , routes = require('./routes')
        , image = require('./routes/image')
        , user = require('./routes/user')
        , signup = require('./routes/signup')
        , admin = require('./routes/admin')
        , index = require('./routes/index')
        , ajax = require('./routes/ajax')
        , http = require('http')
        , path = require('path')
        , dbstuff = require('./dbstuff');


var app = express();
dbstuff.util.open();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(user.loadUser);
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});
app.configure('production', function() {
    app.use(express.errorHandler());
});
app.get("/i/:sessionid", image.index);
app.get("/bg/:imageid", image.sendBackground);
app.get("/tn/:imageid", image.sendThumbnail);
app.get("/tn/:imageid/:wxh", image.sendThumbnail);
app.get('/', routes.index);
app.post('/ajax/:command', ajax.run);
app.get("/signout", user.signout);
app.get("/signup", user.register);
app.get("/login", user.login);
//app.all('*', user.requireAuthentication, user.loadUser);
app.get("/admin",user.requireAuthentication, admin.index);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
