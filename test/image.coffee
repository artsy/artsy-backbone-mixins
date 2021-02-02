_ = require 'underscore'
sinon = require 'sinon'
Backbone = require 'backbone'
imageMixin = require '../lib/image.coffee'

describe 'Image Mixin', ->

  describe "no ssl url", ->
    beforeEach ->
      class Model extends Backbone.Model
        _.extend @prototype, imageMixin(null, null)

      @model = new Model {
        id: _.uniqueId()
        href: '/cats/bitty'
        title: 'This is a page all about Bitty'
        subtitle: "If you are interested in cats, and specifically the best cat in the world, you've come to the right place"
        image_url: '/bitty/:version'
        image_versions: ["large_square", "medium_square", "small_square", "medium_rectangle", "large_rectangle", "small_rectangle"]
        item_type: 'FeaturedLink'
      }

    describe 'imageUrl', ->

      it 'returns missing image', ->
        @model.set { image_versions: [] }
        @model.imageUrl('foo').should.equal '/images/missing_image.png'

      it 'returns an image URL when passed a valid version', ->
        @model.imageUrl('small_square').should.equal '/bitty/small_square'

      it 'returns the first image version by default', ->
        @model.imageUrl().should.equal '/bitty/large_square'

      it 'falls back to any image rather than showing a missing one', ->
        @model.set { image_versions: ['small'] }
        @model.imageUrl('large').should.equal '/bitty/small'

      describe 'with a round image', ->
        beforeEach ->
          @model.set {
            image_versions: [ 'round' ]
            image_url: 'http://stazic1.artsy.net/additional_images/42/:version.jpg'
          }

        it 'returns an image url', ->
          @model.imageUrl('round').should.equal 'http://stazic1.artsy.net/additional_images/42/round.jpg'

    describe 'bestImageUrl', ->

      it 'chooses first version if available', ->
        @model.bestImageUrl(['small_square', 'medium_square']).should.equal '/bitty/small_square'

      it 'chooses later version if early ones unavailable', ->
        @model.bestImageUrl(['unknown_version', 'medium_square']).should.equal '/bitty/medium_square'

      it 'falls back to default version', ->
        @model.bestImageUrl(['unknown_version', 'other_unknown']).should.equal '/bitty/large_square'

      it 'renders missing placeholder if none', ->
        @model.set { image_versions: [] }
        @model.bestImageUrl(['small_square', 'medium_square']).should.equal '/images/missing_image.png'

  describe 'with an ssl url', ->

    beforeEach ->
      class Model extends Backbone.Model
        _.extend @prototype, imageMixin('https://ssl.artsy.net')

      @model = new Model {
        id: _.uniqueId()
        href: '/cats/bitty'
        title: 'This is a page all about Bitty'
        subtitle: "If you are interested in cats, and specifically the best cat in the world, you've come to the right place"
        image_url: 'http://static0.artsy.net/bitty/:version'
        image_versions: ["large_square", "medium_square", "small_square", "medium_rectangle", "large_rectangle", "small_rectangle"]
        item_type: 'FeaturedLink'
      }

    describe 'with an image url', ->

      it 'returns missing image', ->
        @model.unset 'image_versions'
        @model.imageUrl('foo').should.equal '/images/missing_image.png'

      it 'returns an image URL when passed a valid version', ->
        @model.imageUrl('small_square').should.equal 'https://ssl.artsy.net/bitty/small_square'

      it 'returns the first image version by default', ->
        @model.imageUrl().should.equal 'https://ssl.artsy.net/bitty/large_square'

    describe '#hasImage', ->

      it 'returns false if there are no image versions', ->
        @model.set 'image_versions', null
        @model.hasImage().should.be.false

      it 'always allows for access to the original version', ->
        @model.hasImage('original').should.be.true
