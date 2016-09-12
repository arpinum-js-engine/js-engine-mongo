'use strict';

const _ = require('lodash');

function withMongoIds(documents) {
  return _.map(documents, withMongoId);
}

function withMongoId(document) {
  return _.mapKeys(document, (value, key) => key === 'id' ? '_id' : key);
}

function withIds(documents) {
  return _.map(documents, withId);
}

function withId(document) {
  return _.mapKeys(document, (value, key) => key === '_id' ? 'id' : key);
}

function findOne(collection, ...findArgs) {
  return new Promise((resolve, reject) => {
    collection.find(...findArgs).limit(1).next((error, result) => {
      if (error) {
        throw reject(error);
      }
      resolve(result);
    });
  });
}

function partialSetObject(property, partialObject) {
  return _.mapKeys(partialObject, (value, key) => `${property}.${key}`);
}

function humanSortToMongoSort(humanSort) {
  return _.mapValues(humanSort, value => {
    let mapping = {
      ascending: 1,
      descending: -1
    };
    return mapping[value];
  });
}

module.exports = {
  withMongoId,
  withMongoIds,
  withId,
  withIds,
  findOne,
  partialSetObject,
  humanSortToMongoSort
};
