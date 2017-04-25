'use strict';
const Hapi = require('hapi');
const Blipp = require('blipp');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Handlebars = require('handlebars');
const fs = require("fs");
const Sequelize = require('sequelize');
const Fetch = require ("node-fetch");


const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});





var sequelize;

server.connection({
    port: (process.env.PORT || 3000)
});


if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: true //false
    })
} else {
    sequelize = new Sequelize('db', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }, // SQLite only
    storage: 'db.sqlite'
});
}



var locations = sequelize.define('data', {
    term:{
        type: Sequelize.STRING
    },
    studentname:{
        type: Sequelize.STRING
    },
    storename: {
        type: Sequelize.STRING
    },
    storeaddress: {
        type: Sequelize.STRING
    },
    storecity: {
        type: Sequelize.STRING
    },
    storestate: {
        type: Sequelize.STRING
    },
    storeowner: {
        type: Sequelize.STRING
    },
    otherInfo: {
        type: Sequelize.STRING
    },
    
});

server.register([Blipp, Inert, Vision], () => {});

server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers', //partialsPath: 'views/partials'
});

server.route({
    method: 'GET',
    path: '/uploadlocation',
    handler: {
        view: {
            template: 'index'
        }
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'locationUpload'
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: false,
            index: false
        }
    }
});

server.route({
    method: 'POST',
    path: '/form',
    handler: function (request, reply) {
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //        console.log(request.payload);

        locations.create(parsing).then(function (Love1) {
            locations.sync();
            console.log("...syncing");
            console.log(Love1);
            return (Love1);
        }).then(function (Love1) {

            reply.view('formresponse', {
                formresponse: Love1
            });
        });
    }
});


server.route({
    method: 'GET',
    path: '/displayAll',
    handler: function (request, reply) {
        locations.findAll().then(function (users) {
            // projects will be an array of all User instances
            //console.log(users[0].monsterName);
            var allUsers = JSON.stringify(users);
            reply.view('dbresponse', {
                dbresponse: allUsers
            });
        });
    }
});


server.route({
    method: 'GET',
    path: '/destroyAll',
    handler: function (request, reply) {

        locations.drop();

        reply("destroy all");
    }
});

server.route({
    method: 'GET',
    path: '/delete/{id}',
    handler: function (request, reply) {


        locations.destroy({
            where: {
                id: encodeURIComponent(request.params.id)
            }
        });

        reply().redirect("/displayAll");
    }
});

server.route({
    method: 'GET',
    path: '/find/{storename}',
    handler: function (request, reply) {
        locations.findOne({
            where: {
                storename: encodeURIComponent(request.params.storename),
            }
        }).then(function (user) {
            var currentUser = "";
            currentUser = JSON.stringify(user);
            //console.log(currentUser);
            currentUser = JSON.parse(currentUser);
            console.log(currentUser);
            reply.view('find', {
                dbresponse: currentUser
            });

        });
    }
});

server.route({
    method: 'GET',
    path: '/update/{id}',
    handler: function (request, reply) {
        var id = encodeURIComponent(request.params.id);


        reply.view('updatelocations', {
            routeId: id
        });
    }

});

server.route({
    method: 'POST',
    path: '/update/{id}',
    handler: function (request, reply) {
        var cm = "";
        var id = encodeURIComponent(request.params.id);
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        locations.update(parsing, {
            where: {
                id: id
            }
        });
        reply().redirect("/displayAll");

    }

});

server.route({
    method:'GET',
    path:'/radarChart',
    handler:function(request,reply){
//      var formresponse = JSON.stringfy(request.payload);
//      var parsing = JSON.parse(formresponse);
//        
//      var data = {};
//       locations.findAll().then(function(ha){
//           data = JSON.parse(JSON.stringify(ha));
//            console.log(data);
//       });
        
        reply.view('radarchart', null, {
            layout:'none'
        });
    }
    
});

server.route({
    method:'GET',
    path:'/radarChart1',
    handler:function(request,reply){
//      var formresponse = JSON.stringfy(request.payload);
//      var parsing = JSON.parse(formresponse);
//        
//      var data = {};
//       locations.findAll().then(function(ha){
//           data = JSON.parse(JSON.stringify(ha));
//            console.log(data);
//       });
        
        reply.view('radarchart1', null, {
            layout:'none'
        });
    }
    
});

server.route({
    method:'GET',
    path:'/barChart',
    handler:function(request,reply){
//      var formresponse = JSON.stringfy(request.payload);
//      var parsing = JSON.parse(formresponse);
//        
//      var data = {};
//       locations.findAll().then(function(ha){
//           data = JSON.parse(JSON.stringify(ha));
//            console.log(data);
//       });
        
        reply.view('barchart', null, {
            layout:'none'
        });
    }
    
});

server.route({
    method:'GET',
    path:'/barChart1',
    handler:function(request,reply){
//      var formresponse = JSON.stringfy(request.payload);
//      var parsing = JSON.parse(formresponse);
//        
//      var data = {};
//       locations.findAll().then(function(ha){
//           data = JSON.parse(JSON.stringify(ha));
//            console.log(data);
//       });
        
        reply.view('barchart2', null, {
            layout:'none'
        });
    }
    
});

server.route({
    method:'GET',
    path:'/line',
    handler:function(request,reply){
//      var formresponse = JSON.stringfy(request.payload);
//      var parsing = JSON.parse(formresponse);
//        
//      var data = {};
//       locations.findAll().then(function(ha){
//           data = JSON.parse(JSON.stringify(ha));
//            console.log(data);
//       });
        
        reply.view('linechart', null, {
            layout:'none'
        });
    }
    
});

server.route({
    method:'GET',
    path:'/line1',
    handler:function(request,reply){
//      var formresponse = JSON.stringfy(request.payload);
//      var parsing = JSON.parse(formresponse);
//        
//      var data = {};
//       locations.findAll().then(function(ha){
//           data = JSON.parse(JSON.stringify(ha));
//            console.log(data);
//       });
        
        reply.view('linechart1', null, {
            layout:'none'
        });
    }
    
});

server.route({
    method:'GET',
    path:'/getdata',
    handler:function(request,reply){
        var data = {};
        locations.findAll().then(function(d){
            data = JSON.stringify(d);
            reply(data);
        });
    }
    
});

server.route({
    method: 'GET',
    path: '/createDB',
    handler: function (request, reply) {
        // force: true will drop the table if it already exists
        locations.sync({
            force: true
        });
        reply("Database Created")
    }
});
server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
});