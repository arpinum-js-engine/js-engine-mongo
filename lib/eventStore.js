'use strict';

const _ = require('lodash');
const t = require('tcomb');
const mongo = require('./mongo');
const uuid = require('node-uuid');

const Creation = t.interface({
  databaseClient: t.Object,
  options: t.maybe(t.struct({
    batchSize: t.maybe(t.Integer)
  }))
}, {strict: true});

class EventStore {

  constructor(creation) {
    let {databaseClient, options} = Creation(creation);
    this._collection = databaseClient.collection('events');
    this._options = parseOptions(options);

    function parseOptions(options) {
      return _.defaults(options || {}, {
        batchSize: 1000
      });
    }
  }

  add(event) {
    return this._collection.insertOne(mongo.withMongoId(event));
  }

  addAll(events) {
    if (_.isEmpty(events)) {
      return Promise.resolve();
    }
    return this._collection.insertMany(batchifyIfNeeded(events));
    function batchifyIfNeeded(events) {
      if (events.length <= 1) {
        return events;
      }
      let batchId = uuid.v4();
      return _.map(events, (event, index) => {
        let batch = {id: batchId, index: index};
        return Object.assign({}, mongo.withMongoId(event), {batch});
      });
    }

  }

  eventsFromAggregate(id, type) {
    return this._find({'aggregate.id': id, 'aggregate.type': type});
  }

  eventsFromTypes(types, newerThanThisEventId) {
    let criteria = {type: {$in: types}};
    if (newerThanThisEventId) {
      criteria._id = {$gt: newerThanThisEventId};
    }
    return this._find(criteria);
  }

  _find(criteria) {
    return this._collection
      .find(criteria)
      .sort({_id: 1})
      .batchSize(this._options.batchSize)
      .map(mongo.withId)
      .stream();
  }
}

module.exports = {EventStore};
