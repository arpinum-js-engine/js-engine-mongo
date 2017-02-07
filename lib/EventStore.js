'use strict';

const _ = require('lodash');
const t = require('tcomb');
const mongo = require('./mongo');
const uuid = require('node-uuid');

const Construction = t.struct({
  databaseClient: t.Object,
  options: t.maybe(t.Object)
}, {strict: true});

function createEventStore(construction) {
  let {databaseClient, options:rawOptions} = Construction(construction);
  let options = parseOptions(rawOptions);
  return {
    add,
    addAll,
    eventsFromAggregate,
    eventsFromTypes
  };

  function parseOptions(options) {
    return _.defaults(options || {}, {
      batchSize: 1000
    });
  }

  function add(event) {
    return collection().insertOne(mongo.withMongoId(event));
  }

  function addAll(events) {
    if (_.isEmpty(events)) {
      return Promise.resolve();
    }
    return collection().insertMany(batchifyIfNeeded(events));
  }

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

  function eventsFromAggregate(id, type) {
    return find({'aggregate.id': id, 'aggregate.type': type});
  }

  function eventsFromTypes(types, newerThanThisEventId) {
    let criteria = {type: {$in: types}};
    if (newerThanThisEventId) {
      criteria._id = {$gt: newerThanThisEventId};
    }
    return find(criteria);
  }

  function find(criteria) {
    return collection()
      .find(criteria)
      .sort({_id: 1})
      .batchSize(options.batchSize)
      .map(mongo.withId)
      .stream();
  }

  function collection() {
    return databaseClient.collection('events');
  }
}

module.exports = createEventStore;
