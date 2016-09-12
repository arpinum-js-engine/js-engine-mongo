'use strict';

const _ = require('lodash');
const mongo = require('./mongo');
const uuid = require('node-uuid');

class MongoEventStore {

  constructor(mongoClient, options) {
    this._options = this._parseOptions(options);
    this._mongoClient = mongoClient;
  }

  _parseOptions(options) {
    return _.defaults(options || {}, {
      batchSize: 1000
    });
  }

  add(event) {
    return this._collection().insertOne(mongo.withMongoId(event));
  }

  addAll(events) {
    if (_.isEmpty(events)) {
      return Promise.resolve();
    }
    return this._collection().insertMany(this._batchifyIfNeeded(events));
  }

  _batchifyIfNeeded(events) {
    if (events.length <= 1) {
      return events;
    }
    let batchId = uuid.v4();
    return _.map(events, (event, index) => {
      let batch = {id: batchId, index: index};
      return Object.assign({}, mongo.withMongoId(event), {batch});
    });
  }

  eventsFromAggregate(id, type) {
    return this._find({'aggregateRoot.id': id, 'aggregateRoot.type': type});
  }

  eventsFromTypes(types, newerThanThisEventId) {
    let criteria = {type: {$in: types}};
    if (newerThanThisEventId) {
      criteria._id = {$gt: newerThanThisEventId};
    }
    return this._find(criteria);
  }

  _find(criteria) {
    return this._collection()
      .find(criteria)
      .sort({_id: 1})
      .batchSize(this._options.batchSize)
      .map(mongo.withId)
      .stream();
  }

  _collection() {
    return this._mongoClient.collection('events');
  }
}

module.exports = MongoEventStore;
