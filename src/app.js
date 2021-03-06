var _express = require("express");
var _binlookup = require("binlookup")();
var _redis = require("redis");

var server = _express();

server.get("/lookup/:prefix", processBinLookup );


var cache = (process.env.REDIS_URL)?_redis.createClient(process.env.REDIS_URL):{};
var cache_period = 60*60; //Default 1 hour
if( process.env.CACHE_TTL ){
    try{
        cache_period = parseInt(process.env.CACHE_TTL);
    } catch( error ){
        console.log( "Invalid CACHE_TTL ", error );
    }
}
console.log( "Cache Time To Live (seconds) : ", cache_period );

function processBinLookup( req, res ){
    var prefix = req.params.prefix;
    if( prefix ){
        lookupCache(prefix)
        .then(function(data){
            console.log( "Cached - ", data );
            if( data ){
                respond(data,res);
            } else {
                directLookup(prefix,res);
            }
        })
        .catch(function(data){
            console.log( "Looking up ", prefix );
            directLookup(prefix,res);
        });
    } else {
        res.sendStatus(200);
    }
}

function directLookup( prefix, res ){
    _binlookup(prefix)
    .then(function(data){
        putToCache( prefix, data );
        respond(data,res);
    })
    .catch(function(err){
        console.log( err );
        res.sendStatus(404);
    });
}

function lookupCache(prefix){
    return new Promise(function(resolve,reject){
        getFromCache(prefix)
        .then(resolve,reject);
    });
}

function respond( data, res ){
    res.status(200).send(data).end();
}

function getFromCache(prefix){
    cache = cache || {};
    return new Promise(function(resolve, reject){
        if( typeof cache.get === "function" ){
            cache.get(prefix,function(err,data){
                if( err ){
                    reject(err);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        } else {
            var cached = cache[prefix];
            if( cached ){
                resolve(cached);
            } else {
                reject();
            }
        }
    });
}

function putToCache(prefix, data){
    cache = cache || {};
    if( typeof cache.hmset === "function" ){
        cache.set(prefix, JSON.stringify(data));
        if( cache_period ){
            cache.expire(prefix, cache_period);
        }
    } else {
        cache[prefix] = data;
    }
}

module.exports = server;