_ = require 'underscore'
Backbone = require 'backbone'
aToZ = require '../lib/a_to_z'

class AToZCollectionModel extends Backbone.Model
  alphaSortKey: -> @get 'sortable_id'
  displayName: -> @get 'name'
  href: -> "/#{@get('sortable_id')}"

class AToZCollection extends Backbone.Collection
  _.extend @prototype, aToZ
  model: AToZCollectionModel

describe 'A to Z mixin', ->

  beforeEach ->
    @m1 = new AToZCollectionModel({ sortable_id: "twenty-thirteen", name: "Twenty Thirteen" })
    @m2 = new AToZCollectionModel({ sortable_id: "2014", name: "2014" })
    @m3 = new AToZCollectionModel({ sortable_id: "twenty-fourteen", name: "Twenty Fourteen" })
    @m4 = new AToZCollectionModel({ sortable_id: "fifteen-plus-twenty", name: "Fifteen + Twenty" })
    @m5 = new AToZCollectionModel({ sortable_id: "two-times", name: "Two Times" })
    @m6 = new AToZCollectionModel({ sortable_id: "tim", name: "Tim" })
    @collection = new AToZCollection([ @m1, @m2, @m3, @m4, @m5, @m6 ])

  describe '#groupByAlpha', ->

    it 'groups models by sort letter', ->
      grouped = @collection.groupByAlpha()
      grouped['0-9'].length.should.equal 1
      grouped['0-9'][0].should.equal @m2
      grouped.T.length.should.equal 4
      grouped.F.length.should.equal 1

  describe '#groupByAlphaWithColumns', ->

    it 'groups sorted letters and formatted models in columns', ->
      grouped = @collection.groupByAlphaWithColumns 3
      grouped.length.should.equal 3
      grouped[0].letter.should.equal "0-9"
      grouped[1].letter.should.equal "F"
      grouped[2].letter.should.equal "T"
      _.each grouped, (group) -> group.columns.length.should.equal 3

    it 'requires collection models to have a displayName method', ->
      class NoDisplayNameModel extends Backbone.Model
        displayName: null
        href: -> "/#{@get('sortable_id')}"
      m = new NoDisplayNameModel({ sortable_id: "zz", name: "Z Z" })
      collection = new AToZCollection([], { model: NoDisplayNameModel })
      collection.add m
      (() -> collection.groupByAlphaWithColumns()).should.throw()

    it 'requires collection models to have an href method', ->
      class NoHrefModel extends Backbone.Model
        displayName: -> @get 'name'
        href: null
      m = new NoHrefModel({ sortable_id: "zz", name: "Z Z" })
      collection = new AToZCollection([], { model: NoHrefModel })
      collection.add m
      (() -> collection.groupByAlphaWithColumns()).should.throw()

    it 'handles link to page', ->
      m0 = new AToZCollectionModel({ sortable_id: "1", name: "Twenty1", artworks_count: 1 })
      m1 = new AToZCollectionModel({ sortable_id: "2", name: "Twenty2", artworks_count: 0 })
      m2 = new AToZCollectionModel({ sortable_id: "3", name: "Twenty3" })
      collection = new AToZCollection([ m0, m1, m2 ])
      grouped = collection.groupByAlphaWithColumns(1)[0].columns[0]
      grouped[0].linkToPage.should.be.ok
      grouped[1].linkToPage.should.not.be.ok
      grouped[2].linkToPage.should.be.ok
