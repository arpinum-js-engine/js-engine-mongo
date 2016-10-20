'use strict';

const mongo = require('./mongo');

class MongoProjectionTracker {

  constructor(mongoClient, collection) {
    this._mongoClient = mongoClient;
    this._collection = this._mongoClient.collection(collection);
  }

  getLastProcessedEventId(projectionName) {
    return mongo.findOne(this._collection, {_id: projectionName})
      .then(result => result ? result.lastProcessedEventId : null);
  }

  updateLastProcessedEventId(projectionName, id) {
    return this._collection.replaceOne({_id: projectionName}, {lastProcessedEventId: id}, {upsert: true});
  }
}

module.exports = MongoProjectionTracker;
