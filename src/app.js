var _express = require("express");
var _binlookup = require("binlookup")();

var server = _express();

server.get("/lookup/:prefix", processBinLookup );

var cache = {};

function processBinLookup( req, res ){
    var prefix = req.params.prefix;
    if( prefix ){
        var result = getFromCache(prefix);
        if( !result ){
            console.log( "Looking up ", prefix );
            _binlookup(prefix)
            .then(function(data){
                putToCache( prefix, data );
                res.status(200).send(data).end();
            })
            .catch(function(err){
                console.log( err );
                res.sendStatus(404);
            });
        } else {
            console.log( "Cached" );
            res.status(200).send(result).end();
        }
    } else {
        res.sendStatus(200);
    }
}

function getFromCache(prefix){
    cache = cache || {};
    return cache[prefix];
}

function putToCache(prefix, data){
    cache = cache || {};
    cache[prefix] = data;
}

module.exports = server;