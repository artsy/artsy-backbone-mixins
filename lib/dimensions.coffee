_ = require 'underscore'

module.exports =

  dimensions: (metric = @get('metric')) ->
    @get('dimensions')[metric] if metric

  # Wrap only X Y/Z; leave X/Y alone
  superscriptFractions: (string) ->
    string?.replace /(\d+)(?:\s+)(\d+\/\d+)/g, '$1 <sup>$2</sup>'
