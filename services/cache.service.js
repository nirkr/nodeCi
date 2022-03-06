const mongoose = require('mongoose');
const util = require('util');

const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
client.hset = util.promisify(client.hset);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function(options) {
    this.useCache = true; // using this allows us to use it over the other exec impl.
    this.hashkey = JSON.stringify(options.key || '');
    return this; // to allow chaining of cache function
}

mongoose.Query.prototype.exec = async function() {
    if (this.useCache){
        const key = JSON.stringify(Object.assign({}, this.getQuery(),
            {collection: this.mongooseCollection.name}));
        console.log({key})
        const cachedData = await client.hget(this.hashkey, key);
        if (cachedData){
            console.log({cachedData})
            const doc = JSON.parse(cachedData);
            // 2. mongoose query handels documents, not json => need to return mongoose models
            return Array.isArray(doc) // checking if we get one record or an array- new this.model() is per doc
                ? doc.map(d => new this.model(d))
                : new this.model(doc); // this.model = reference to the model instance of the query
        }
        const result = await exec.apply(this, arguments);
        // 1. redis handles json, while result holds Mongoose documents => need to JSON.stringify() it
        await client.hset(this.hashkey, key, JSON.stringify(result));
        this.useCache = false;
        console.log({result})
        return result;
    }
    return await exec.apply(this, arguments);
}

module.exports = {
    removeCache: (hashKey)=> {
        client.del(JSON.stringify(hashKey));
    }
}
