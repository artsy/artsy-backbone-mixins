_ = require 'underscore'
Image = require './image'

module.exports =

  # Returns the best image url it can find for the index and size.
  #
  # param {String} version
  # param {Number} i
  # return {String}
  imageUrl: (version = 'larger', i) ->
    imgs = @get('images')
    return unless imgs?.length
    if i
      img = _.findWhere(imgs, position: i) or imgs[i] or imgs[0]
    else
      img = _.findWhere(imgs, is_default: true) or imgs[0]
    return unless img
    url = img.image_urls?[version]
    url or= img.image_url?.replace(':version', v) if v = img.image_versions?[version]
    url or= _.values(img.image_urls)[0]
    url or= img.image_url?.replace(':version', _.first(img.image_versions))
    url

  # Are there comparable artworks;
  # such that we can display a link to auction results
  #
  # return {Boolean}
  isComparable: ->
    (@get('comparables_count') > 0) and (@get('category') isnt 'Architecture')

  # Can we display a price?
  #
  # return {Boolean}
  isPriceDisplayable: ->
    (@has('price')) and
    not @isMultipleEditions() and
    (@get('inquireable') or @get('sold')) and
    not @isUnavailableButInquireable() and
    @get('sale_message') isnt 'Contact For Price'

  # Should we include a button to contact the partner?
  #
  # return {Boolean}
  isContactable: ->
    @get('forsale') and @has('partner') and not @get('acquireable')

  # Should we render a full set of editions,
  # as opposed to a single string? (See: #editionStatus)
  #
  # return {Boolean}
  isMultipleEditions: ->
    @get('edition_sets')?.length > 1

  # The work is not for sale but a buyer may be interested
  # in related works
  #
  # return {Boolean}
  isUnavailableButInquireable: ->
    not @get('forsale') and @get('inquireable') and not @get('sold')