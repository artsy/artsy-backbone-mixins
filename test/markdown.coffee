_ = require 'underscore'
sinon = require 'sinon'
Backbone = require 'backbone'
markdown = require '../lib/markdown'

class Model extends Backbone.Model
  _.extend @prototype, markdown

describe 'Dimensions Mixin', ->
  beforeEach ->
    @model = new Model

  describe '#mdToHtml', ->
    it 'returns HTML from parsed markdown', ->
      @model.set { foo: "**foo** *bar*" }
      @model.mdToHtml('foo').should.eql '<p><strong>foo</strong> <em>bar</em></p>\n'

    it 'is defensive about missing data', ->
      @model.set { foo: null }
      @model.mdToHtml('foo').should.equal ''

    it 'is defensive about XSS', ->
      # The next line must end with a single trailing space
      @model.set { foo: "<img src=<script> src='<img<script>alert(document.domain)//</p> " + "
</script>" }
      @model.mdToHtml('foo').should.equal '<p>&lt;img src=&lt;script&gt; src=&#39;&lt;img&lt;script&gt;alert(document.domain)//&lt;/p&gt; &lt;/script&gt;</p>\n'

    it 'is configurable to allow HTML through desireable', ->
      @model.set { foo: '<iframe src="https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4" width="1100" height="733"></iframe>' }
      @model.mdToHtml('foo').should.equal '<p>&lt;iframe src=&quot;<a href="https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4">https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4</a>&quot; width=&quot;1100&quot; height=&quot;733&quot;&gt;&lt;/iframe&gt;</p>\n'
      @model.mdToHtml('foo', { sanitize: false }).should.equal '<iframe src="https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4" width="1100" height="733"></iframe>'

  describe '#mdToHtmlToText', ->
    it 'strips markdown-generated HTML tags', ->
      @model.set { foo: '*bold text*' }
      @model.mdToHtmlToText('foo').trim().should.equal 'bold text'

    it 'strips literal HTML tags', ->
      @model.set { foo: '<b>bold text</b>' }
      @model.mdToHtmlToText('foo').trim().should.equal 'bold text'

  describe '#htmlToText', ->
    it 'handles null input', ->
      @model.set { foo: null }
      @model.htmlToText('foo').should.equal ''

    it 'strips tags', ->
      @model.set { foo: '<p><strong>Obviously</strong> works</p>.' }
      @model.htmlToText('foo').should.equal 'Obviously works.'
