'use strict';

const _ = require('lodash');

function withMongoIds(documents) {
  return _.map(documents, withMongoId);
}

function withMongoId(document) {
  if (!_.has(document, 'id')) {
    return document;
  }
  return Object.assign({}, _.omit(document, 'id'), {_id: document.id});
}

function withIds(documents) {
  return _.map(documents, withId);
}

function withId(document) {
  if (!_.has(document, '_id')) {
    return document;
  }
  return Object.assign({}, _.omit(document, '_id'), {id: document._id});
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
