const _ = require('underscore');

module.exports = {

  dimensions(options) {
    if (options == null) {
      options = {};
    }
    if (options.metric == null) {
      options.metric = this.get('metric');
    }
    let dimensions = this.get('dimensions') ? this.get('dimensions')[options.metric] : undefined;
    dimensions = (() => {
      switch (options.format) {
        case 'superscript':
          return superscriptFractions(dimensions);
        case 'decimal':
          return expressAsMetric(dimensions);
        default:
          return dimensions;
      }
    })();
    return dimensions;
  }
};

// Wrap only X Y/Z; leave X/Y alone
var superscriptFractions = string => string != null ? string.replace(/(\d+)(?:\s+)(\d+\/\d+)/g, '$1 <sup>$2</sup>') : undefined;

const fractionToDecimal = function (string) {
  const split = string.split('/');
  const decimal = parseInt(split[0], 10) / parseInt(split[1], 10);
  if (decimal === Infinity) {
    throw new Error('Division by zero');
  }
  return decimal.toFixed(2);
};

var expressAsMetric = string => string != null ? string.replace(/((\d+)(?:\s+)(\d+\/\d+)|(\d+\/\d+))/g, function (match) {
  try {
    // Replace the fractions with decimal representations
    match = match.replace(/(\d+\/\d+)/g, fractionToDecimal);
    // Collapse either side of the measurement with addition
    return _.map(match.split(' × '), function (x) {
      const nums = _.map(x.split(' '), y => parseFloat(y));
      return _.reduce(nums, ((memo, num) => memo + num), 0);
    }).join(' × ');
  } catch (error) {
    return match;
  }
}) : undefined;
