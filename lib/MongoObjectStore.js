'use strict';

const mongo = require('./mongo');

class MongoObjectStore {

  constructor(mongoClient, collection) {
    this._mongoClient = mongoClient;
    this._collection = this._mongoClient.collection(collection);
  }

  get(key) {
    return mongo.findOne(this._collection, {_id: key}).then(result => {
      if (!result) {
        return null;
      }
      return result.value;
    });
  }

  set(key, value) {
    return this._collection.replaceOne({_id: key}, {value: value}, {upsert: true});
  }

  delete(key) {
    return this._collection.deleteOne({_id: key});
  }
}

module.exports = MongoObjectStore;
