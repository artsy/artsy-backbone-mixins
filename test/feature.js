const _ = require('underscore');
const sinon = require('sinon');
const Backbone = require('backbone');
const FeatureMixin = require('../lib/feature');
const Fetch = require('../lib/fetch');

const {
  fabricate
} = require('antigravity');

class SaleArtwork extends Backbone.Model {}

class FeaturedSet extends Backbone.Model {}

class FeaturedLinks extends Backbone.Collection {
  preinitialize() {
    _.extend(this, Fetch('https://artsy.net'));
  }
}

class Artworks extends Backbone.Collection {
  preinitialize() {
    _.extend(this, Fetch('https://artsy.net'));
  }

  static fromSale(saleArtworks) {
    new Artworks(saleArtworks.map(saleArtwork => _.extend(saleArtwork.get('artwork'), {
      saleArtwork: new SaleArtwork(saleArtwork.omit('artwork'))
    })));
  }
}

class SaleArtworks extends Backbone.Collection {
  preinitialize() {
    _.extend(this, Fetch('https://artsy.net'));
  }
}

class Sale extends Backbone.Model {
  fetchArtworks(options) {
    if (options == null) {
      options = {};
    }
    this.artworks = new SaleArtworks([], {
      id: this.id
    });
    return this.artworks.fetchUntilEnd(options);
  }
}

class Feature extends Backbone.Model {
  preinitialize() {
    _.extend(this, FeatureMixin('https://artsy.net', Sale, Artworks, FeaturedSet, FeaturedLinks));
  }
}

describe('Feature', function () {

  beforeEach(function () {

    this.feature = new Feature(fabricate('feature'));
    return sinon.stub(Backbone, 'sync');
  });

  afterEach(function () { Backbone.sync.restore() });

  return describe('#fetchSets', function () {

    it('collects the sets and items', function (done) {
      this.feature.fetchSets({
        success(sets) {
          sets[0].get('type').should.equal('featured links');
          sets[0].get('name').should.equal('Explore this bidness');
          sets[0].get('data').first().get('title').should.equal('Featured link for this awesome page');
          return done();
        }
      });

      _.last(Backbone.sync.args)[2].success([fabricate('set', {
        name: 'Explore this bidness',
        id: 'abc'
      })]);
      _.last(Backbone.sync.args)[2].success([fabricate('featured_link', {
        title: 'Featured link for this awesome page'
      })]);
      _.last(Backbone.sync.args)[2].success([]);
    });

    it('callsback when the sets are fetched', function (done) {
      this.feature.fetchSets({
        setsSuccess(sets) {
          sets[0].get('type').should.equal('featured links');
          sets[0].get('name').should.equal('Explore this bidness');
          sets[0].get('data').first().get('title').should.equal('Featured link for this awesome page');
          done();
        }
      });

      _.last(Backbone.sync.args)[2].success([fabricate('set', {
        name: 'Explore this bidness',
        id: 'abc'
      })]);
      _.last(Backbone.sync.args)[2].success([fabricate('featured_link', {
        title: 'Featured link for this awesome page'
      })]);
      _.last(Backbone.sync.args)[2].success([]);
    });

    it('callsback when the artworks are fetched page and success', function (done) {
      const successStub = sinon.stub();
      const sale = fabricate('sale');

      this.feature.fetchSets({
        artworkPageSuccess: successStub,
        artworksSuccess: saleFeaturedSet => {
          successStub.called.should.be.ok;
          saleFeaturedSet.get('type').should.equal('artworks');
          this.feature.get('sale').id.should.equal(sale.id);
          done();
        }
      });

      _.last(Backbone.sync.args)[2].success([fabricate('set', {
        name: 'Explore this bidness',
        id: 'abc',
        item_type: 'Sale'
      })]);
      _.last(Backbone.sync.args)[2].success([sale]);
      _.last(Backbone.sync.args)[2].success([]);
    });

    it('fetches until end for sets whose items are featured links', function (done) {
      this.feature.fetchSets({
        success(sets) {
          sets[0].get('type').should.equal('featured links');
          sets[0].get('name').should.equal('Explore this bidness top');
          sets[0].get('data').first().get('title').should.equal('Featured link for this awesome page');
          sets[0].get('data').should.have.lengthOf(12);
          done();
        }
      });

      _.last(Backbone.sync.args)[2].success([fabricate('set', {
        name: 'Explore this bidness top',
        key: '0hello',
        id: 'def'
      })]);

      _.last(Backbone.sync.args)[2].success([
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        })
      ]);
      _.last(Backbone.sync.args)[2].success([
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        }),
        fabricate('featured_link', {
          title: 'Featured link for this awesome page'
        })
      ]);
      _.last(Backbone.sync.args)[2].success([]);
    });

    xit('sorts sets by key', function () {});

    xdescribe('fetching a sale', function () {
      it('proxies the display_artist_list attribute', function () {})
    });
  });
});
