'use strict';

const should = require('chai').should();
const mongo = require('./mongo');

describe('The mongo module', () => {

  it('should replace document id to mongo _id', () => {
    let document = {id: 'the_id', name: 'the_document'};

    let newDocument = mongo.withMongoId(document);

    newDocument.should.deep.equal({_id: 'the_id', name: 'the_document'});
  });

  it('wont do nothing when replacing nullish document id to mongo _id', () => {
    let newDocument = mongo.withMongoId(undefined);

    should.not.exist(newDocument);
  });

  it('should replace multiple documents id to mongo _id', () => {
    let documents = [
      {id: 'the_id', name: 'the_document'},
      {id: 'the_other_id', name: 'the_other_document'}
    ];

    let newDocuments = mongo.withMongoIds(documents);

    newDocuments.should.deep.equal([
      {_id: 'the_id', name: 'the_document'},
      {_id: 'the_other_id', name: 'the_other_document'}
    ]);
  });

  it('should replace document mongo _id to id', () => {
    let document = {_id: 'the_id', name: 'the_document'};

    let newDocument = mongo.withId(document);

    newDocument.should.deep.equal({id: 'the_id', name: 'the_document'});
  });

  it('wont do nothing when replacing nullish document mongo _id to id', () => {
    let newDocument = mongo.withId(undefined);

    should.not.exist(newDocument);
  });

  it('should replace multiple documents mongo _id to id', () => {
    let documents = [
      {_id: 'the_id', name: 'the_document'},
      {_id: 'the_other_id', name: 'the_other_document'}
    ];

    let newDocuments = mongo.withIds(documents);

    newDocuments.should.deep.equal([
      {id: 'the_id', name: 'the_document'},
      {id: 'the_other_id', name: 'the_other_document'}
    ]);
  });

  it('should generate $set object in order to merge instead of replace', () => {
    let partialObject = {firstName: 'John', lastName: 'Doe'};

    let setObject = mongo.partialSetObject('myProperty', partialObject);

    setObject.should.deep.equal({
      'myProperty.firstName': 'John',
      'myProperty.lastName': 'Doe'
    });
  });

  it('should convert a human readable sort object to a mongo one', () => {
    let sort = {date: 'ascending', name: 'descending'};

    let mongoSort = mongo.humanSortToMongoSort(sort);

    mongoSort.should.deep.equal({date: 1, name: -1});
  });
});
