
var Hapi = require('hapi');
var _ = require('underscore');
var _s = require('underscore.string');
var Nunjucks = require('hapi-nunjucks');
var Hoek = require("hoek");
var changeCaseKeys = require("change-case-keys");
require('pretty-error').start();

// 1. Create a server with the host, port, and options defined in the settings.js file
var server = new Hapi.Server();

server.connection({ host: "localhost", port: 3001});

// read every module in the api directory (require-directory is used to read all the files in the directory); this will create an object of modules
var apiRoutesArray = _.values(require("./api"));

// register the API routes (defined in separate modules as hapi plugin objects)

server.register(
    apiRoutesArray, 
    {  routes: { prefix: "/api" }  },
    function(err){ if(err){ throw err; } }
);


// swagger (api documentation)

swaggerOptions = {
    basePath: 'http://localhost:3001',
    apiVersion: "0.0.1"
};

server.register(
    {
        register: require('hapi-swagger'),
        options: swaggerOptions
    }, 
    function (err) {
        if (err){  server.log(['error'], 'hapi-swagger load error: ' + err) }
        else{      server.log(['start'], 'hapi-swagger interface loaded')   }
    }
);


// the keys are the ones that came from the client (camel case);
// modify the keys in request.payload (change from camelCase to underscore_case)
server.ext('onPreHandler', function(request, reply){
    changeCaseKeys(request.payload, "underscored");

    reply.continue();
});

// at this point the keys are the names of the columns in the tables of the db;
// modify the keys in request.response.source (change from underscore_case to camelCase)
server.ext('onPostHandler', function(request, reply){
    if(request.response.variety == "plain"){
        //changeCaseKeys(request.response.source, "camelize");
    }

    reply.continue();
});


server.views({
    path: './views',
    engines: {
        "html"  : Nunjucks
    }
});



server.route({
    path: "/",
    method: "GET",
    handler: function(request, reply){
        return reply.view("index");
    }
});

server.route({
    path: "/assets/{anyPath*}",
    method: "GET",
    handler: {
        directory: { 
            path: './assets' 
        }
    },

});

server.start(function() {
    console.log('Server started at: ' + server.info.uri);
});





/*
var CountriesC = require("./models/countries").collection;
            var countriesC = new CountriesC();

            countriesC.fetch({
                // read data using the following postgres function/view; we could use a different
                // function/view if we wanted
                query: {
                    text: "select * from users_read_all($1)",
                    values: ['{"eraseFields": true}']
                }
            })
            .done(
                function(){
                    console.log(countriesC.toJSON());
                },
                function(err){
                    console.log(err.message);  
                }
            );
*/


