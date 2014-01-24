_                 = require 'underscore'
Backbone          = require 'backbone'
sinon             = require 'sinon'
dimensions        = require '../lib/dimensions'

class Model extends Backbone.Model
  _.extend @prototype, dimensions

describe 'Dimensions Mixin', ->
  beforeEach ->
    @model = new Model

  describe '#dimensions', ->
    it 'returns the dimensions chosen by metric', ->
      @model.set metric: 'in', dimensions: { in: 'foobar' }
      @model.dimensions().should.include 'foobar'

  describe '#superscript', ->

    it 'wraps the dimensions string in a superscript tag when it encounters fractions following whole numbers', ->
      @model.set 'dimensions', { in: '35 4/5 × 35 4/5 in' }
      @model.superscriptFractions(@model.get('dimensions').in).should.equal '35 <sup>4/5</sup> × 35 <sup>4/5</sup> in'

    it 'leaves bare fractions alone', ->
      @model.set 'dimensions', { in: '35 4/5 × 1/2 in' }
      @model.superscriptFractions(@model.get('dimensions').in).should.equal '35 <sup>4/5</sup> × 1/2 in'
      @model.set 'dimensions', { in: '1/2 × 1/2 in' }
      @model.superscriptFractions(@model.get('dimensions').in).should.equal '1/2 × 1/2 in'