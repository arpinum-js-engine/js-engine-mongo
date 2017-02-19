'use strict';

const {TypedEventStore} = require('@arpinum/ddd');
const {EventStore} = require('./eventStore');

describe('The event store', () => {

  let eventStore;

  beforeEach(() => {
    let databaseClient = {
      collection: () => undefined
    };
    eventStore = new EventStore({databaseClient});
  });

  it('should match TypedEventStore', () => {
    TypedEventStore.is(eventStore).should.be.true;
  });
});
