# artsy-backbone-mixins

A library of Backbone mixins that DRY up some common domain logic and Artsy API rabbit holes.

Functions are namespaced by common sets of functionality such as "Markdown", "Image", or "Dimensions".

````coffeescript
_ = require 'underscore'
{ Markdown, Image } = require 'artsy-backbone-mixins'

class Artwork extends Backbone.Model

  _.extend @prototype, Markdown
  _.extend @prototype, Image
````

## Markdown

````coffeescript
{ Markdown } = require 'artsy-backbone-mixins'

class Artwork extends Backbone.Model

  _.extend @prototype, Markdown

````

### mdToHtml(attr)

Converts an attribute into markdown using showdown.js

````coffeescript
artist.mdToHtml('biography')
````

### mdToHtmlToText(attr)

Converts an attribute into markdown & escapes html.

````coffeescript
artist.mdToHtmlToText('biography')
````

### htmlToText(attr)

Escapes html from an attribute.

````coffeescript
artist.htmlToText('biography')
````

## Dimensions

````coffeescript
{ Dimensions } = require 'artsy-backbone-mixins'

class Artwork extends Backbone.Model

  _.extend @prototype, Dimensions

````

### dimensions([metric])

Commonly dimensions in Artsy's API is structured like `{ dimensions: { in: "10 x 20" }, metric: "in" }`. This provides a convenient default

````coffeescript
artist.dimensions()
artist.dimensions('cm')
````

### superscriptFractions(string)

Turns 10 3/4 into superscript html like 10 `<sup>3/4</sup>`.

````coffeescript
artist.superscriptFractions('10 3/4')
````

## Fetch

* Remember to pass in the artsy url.

````coffeescript
{ Fetch } = require 'artsy-backbone-mixins'
{ ARTSY_URL } = require('sharify').data

class Artwork extends Backbone.Model

  _.extend @prototype, Fetch(ARTSY_URL)

````

### fetchUntilEnd(options)

For paginated routes, fetches the collection's url until the endpoint returns 0 results.

````coffeescript
artworks.fetchUntilEnd success: ->
  # Phew... I have all the artworks from Artsy
````

### fetchSetItemsByKey(key, options)

Fetches a set by key and populates the collection with the first result.

````coffeescript
featuredLinks.fetchSetItemsByKey 'homepage:featured-sections', success: ->
  featuredLinks.first().get('name').should.equal 'Magnum Photos'
````

## Contributing

Please fork the project and submit a pull request with tests. Install node modules `npm install` and run tests with `make test`.

## License

MIT
