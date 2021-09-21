const _ = require('underscore');
const Backbone = require('backbone');
const aToZ = require('../lib/a_to_z');

class AToZCollectionModel extends Backbone.Model {
  alphaSortKey() {
    return this.get('sortable_id');
  }
  displayName() {
    return this.get('name');
  }
  href() {
    return `/${this.get('sortable_id')}`;
  }
}

class AToZCollection extends Backbone.Collection {
  preinitialize() {
    _.extend(this, aToZ);
    this.model = AToZCollectionModel;
  }
}

describe('A to Z mixin', function () {

  beforeEach(function () {
    this.m1 = new AToZCollectionModel({
      sortable_id: "twenty-thirteen",
      name: "Twenty Thirteen"
    });
    this.m2 = new AToZCollectionModel({
      sortable_id: "2014",
      name: "2014"
    });
    this.m3 = new AToZCollectionModel({
      sortable_id: "twenty-fourteen",
      name: "Twenty Fourteen"
    });
    this.m4 = new AToZCollectionModel({
      sortable_id: "fifteen-plus-twenty",
      name: "Fifteen + Twenty"
    });
    this.m5 = new AToZCollectionModel({
      sortable_id: "two-times",
      name: "Two Times"
    });
    this.m6 = new AToZCollectionModel({
      sortable_id: "tim",
      name: "Tim"
    });
    return this.collection = new AToZCollection([this.m1, this.m2, this.m3, this.m4, this.m5, this.m6]);
  });

  describe('#groupByAlpha', function () {

    it('groups models by sort letter', function () {
      const grouped = this.collection.groupByAlpha();
      grouped['0-9'].length.should.equal(1);
      grouped['0-9'][0].should.equal(this.m2);
      grouped.T.length.should.equal(4);
      grouped.F.length.should.equal(1);
    })
  });

  describe('#groupByAlphaWithColumns', function () {

    it('groups sorted letters and formatted models in columns', function () {
      const grouped = this.collection.groupByAlphaWithColumns(3);
      grouped.length.should.equal(3);
      grouped[0].letter.should.equal("0-9");
      grouped[1].letter.should.equal("F");
      grouped[2].letter.should.equal("T");
      _.each(grouped, group => group.columns.length.should.equal(3));
    });

    it('requires collection models to have a displayName method', function () {
      class NoDisplayNameModel extends Backbone.Model {
        static initClass() {
          this.prototype.displayName = null;
        }
        href() {
          return `/${this.get('sortable_id')}`;
        }
      }
      NoDisplayNameModel.initClass();
      const m = new NoDisplayNameModel({
        sortable_id: "zz",
        name: "Z Z"
      });
      const collection = new AToZCollection([], {
        model: NoDisplayNameModel
      });
      collection.add(m);
      ((() => collection.groupByAlphaWithColumns())).should.throw();
    });

    it('requires collection models to have an href method', function () {
      class NoHrefModel extends Backbone.Model {
        static initClass() {
          this.prototype.href = null;
        }
        displayName() {
          return this.get('name');
        }
      }
      NoHrefModel.initClass();
      const m = new NoHrefModel({
        sortable_id: "zz",
        name: "Z Z"
      });
      const collection = new AToZCollection([], {
        model: NoHrefModel
      });
      collection.add(m);
      ((() => collection.groupByAlphaWithColumns())).should.throw();
    });

    it('handles link to page', function () {
      const m0 = new AToZCollectionModel({
        sortable_id: "1",
        name: "Twenty1",
        artworks_count: 1
      });
      const m1 = new AToZCollectionModel({
        sortable_id: "2",
        name: "Twenty2",
        artworks_count: 0
      });
      const m2 = new AToZCollectionModel({
        sortable_id: "3",
        name: "Twenty3"
      });
      const collection = new AToZCollection([m0, m1, m2]);
      const grouped = collection.groupByAlphaWithColumns(1)[0].columns[0];
      grouped[0].linkToPage.should.be.ok;
      grouped[1].linkToPage.should.not.be.ok;
      grouped[2].linkToPage.should.be.ok;
    });
  });
});
