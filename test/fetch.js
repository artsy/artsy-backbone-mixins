const sinon = require('sinon');
const _ = require('underscore');
const Backbone = require('backbone');
const Fetch = require('../lib/fetch');

class Collection extends Backbone.Collection {
  preinitialize() {
    _.extend(this, Fetch('foobar'));
    this.url = 'foo/bar';
  }
}

describe('fetch until end mixin', function () {

  let collection;
  beforeEach(function () {
    sinon.stub(Backbone, 'sync');
    collection = new Collection;
  });

  afterEach(function () {
    Backbone.sync.restore()
  });

  describe('#fetchUntilEnd', function () {

    it('keeps fetching until the API returns no results', function (done) {
      collection.fetchUntilEnd({
        success: () => {
          collection.should.have.lengthOf(3);
          done();
        }
      });
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([]);
    });

    it('respects the starting page param passed in the options', function (done) {
      collection.fetchUntilEnd({
        data: {
          page: 5
        },
        success: () => {
          collection.should.have.lengthOf(2);
          return done();
        }
      });
      Backbone.sync.args[0][2].data.page.should.equal(5);
      Backbone.sync.args[0][2].success([{
        foo: 'bar1'
      }, {
        foo: 'bar2'
      }]);
      Backbone.sync.args[0][2].success([]);
    });

    it('runs the each callback on every page fetch', function () {
      const eachStub = sinon.stub();
      collection.fetchUntilEnd({
        each: eachStub
      });
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([]);
      eachStub.callCount.should.equal(4);
    });

    it('works with complete with error', function (done) {
      collection.fetchUntilEnd({
        complete() {
          done();
        }
      });
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].error();
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
    });

    it('works with complete with success', function (done) {
      collection.fetchUntilEnd({
        complete() {
          done();
        }
      });
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([{
        foo: 'bar'
      }]);
      Backbone.sync.args[0][2].success([]);
    });
  });
});

describe('fetch set items by key mixin', function () {

  let collection
  beforeEach(function () {
    sinon.stub(Backbone, 'sync');
    collection = new Collection;
  });

  afterEach(function () {
    Backbone.sync.restore()
  });

  describe('#fetchSetItemsByKey', function () {

    it("fetches the items for the first set by a key", function (done) {
      collection.fetchSetItemsByKey('foo:bar', {
        success: () => {
          collection.first().get('name').should.equal('FooBar');
          done();
        }
      });
      Backbone.sync.args[0][2].success([{
          id: _.uniqueId(),
          key: 'homepage:featured',
          item_type: 'FeaturedLink',
          display_on_mobile: true,
          display_on_desktop: true
        },
        {
          id: _.uniqueId(),
          key: 'homepage:featured',
          item_type: 'FeaturedLink',
          display_on_mobile: true,
          display_on_desktop: true
        }
      ]);
      Backbone.sync.args[1][2].url.should.match(new RegExp(`set/.*/items`));
      Backbone.sync.args[1][2].success([{
        name: 'FooBar'
      }]);
    });

    it('returns an empty collection if there are no sets', function (done) {
      collection.fetchSetItemsByKey('foo:bar', {
        success: () => {
          collection.models.length.should.equal(0);
          done();
        }
      });
      Backbone.sync.args[0][2].success([]);
    });

    // TODO: This test didn't work prior to decaffeination, done was never being called.
    // adding done cause it to hang.
    xit('retains the collections model definition', function (done) {
      class Foo extends Backbone.Model {
        preinitialize() {
          this.fooId = 'bar';
        }
      }
      collection.model = Foo;
      collection.fetchSetItemsByKey('foo:bar', {
        success: () => {
          collection.first().fooId.should.equal('bar');
          done();
        }
      });
      Backbone.sync.args[0][2].success([{}]);
    });
  });
});


describe('fetch until end in parallel mixin', function () {
  let collection
  beforeEach(function () {
    sinon.stub(Backbone, 'sync');
    collection = new Collection;
  });

  afterEach(function () {
    Backbone.sync.restore()
  });

  describe('#fetchUntilEndInParallel', function () {
    it('sets total_count', function () {
      collection.fetchUntilEndInParallel();
      Backbone.sync.args[0][2].data.should.containEql('total_count');
      Backbone.sync.args[0][2].data.should.containEql('size');
    });

    it('queues up the remaining pages', function () {
      collection.fetchUntilEndInParallel();
      Backbone.sync.args[0][2].res = {
        headers: {
          'x-total-count': 77
        }
      };
      Backbone.sync.args[0][2].success([]);
      _.map(Backbone.sync.args, args => args[2].data).should.eql([
        "total_count=1&size=10",
        "size=10&page=2",
        "size=10&page=3",
        "size=10&page=4",
        "size=10&page=5",
        "size=10&page=6",
        "size=10&page=7",
        "size=10&page=8"
      ]);
    });

    it('maintains the original options', function () {
      collection.fetchUntilEndInParallel({
        url: 'http://foo.bar/baz',
        data: {
          zone: 'no-flex',
          size: 12,
        }
      });
      Backbone.sync.args[0][2].res = {
        headers: {
          'x-total-count': 25
        }
      };
      Backbone.sync.args[0][2].success([]);
      _.map(Backbone.sync.args, args => args[2].url).should.eql([
        'http://foo.bar/baz',
        'http://foo.bar/baz',
        'http://foo.bar/baz'
      ]);
      _.map(Backbone.sync.args, args => args[2].data).should.eql([
        "zone=no-flex&size=12&total_count=1",
        "zone=no-flex&size=12&page=2",
        "zone=no-flex&size=12&page=3"
      ]);
    });

    it('returns early if we are done on the first fetch', function (done) {
      collection.fetchUntilEndInParallel().then(function () {
        Backbone.sync.callCount.should.equal(1);
        done();
      });
      Backbone.sync.args[0][2].res = {
        headers: {
          'x-total-count': 2
        }
      };
      Backbone.sync.args[0][2].success(['x', 'x']);
    });

    it('rejects the promise if it errors early', function (done) {
      collection.fetchUntilEndInParallel().then((function () {}), (() => done()));
      Backbone.sync.args[0][2].res = {
        headers: {
          'x-total-count': 20
        }
      };
      Backbone.sync.args[0][2].error();
    });

    it('supports the success callback');

    it('supports the error callback');

    it('supports the each callback'); // todo

    it('accepts a string as options.data', function () {
      collection.fetchUntilEndInParallel({
        url: 'http://foo.bar/baz',
        data: {
          type: ['CoolType', 'DumbType'],
          size: 12
        },
        stringify: true,
      });
      Backbone.sync.args[0][2].res = {
        headers: {
          'x-total-count': 25
        }
      };
      Backbone.sync.args[0][2].success([]);
      _.map(Backbone.sync.args, args => args[2].url).should.eql([
        'http://foo.bar/baz',
        'http://foo.bar/baz',
        'http://foo.bar/baz'
      ]);
      _.map(Backbone.sync.args, args => args[2].data).should.eql([
        'type[]=CoolType&type[]=DumbType&size=12&total_count=1',
        'type[]=CoolType&type[]=DumbType&size=12&page=2',
        'type[]=CoolType&type[]=DumbType&size=12&page=3'
      ]);
    });
  });
});
