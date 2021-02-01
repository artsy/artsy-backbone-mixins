// Generated by CoffeeScript 1.12.7
(function() {
  var _;

  _ = require('underscore');

  module.exports = {
    groupByAlpha: function() {
      var instance;
      instance = new this.model();
      return this.groupBy(function(model) {
        var key, letter;
        key = (typeof model.alphaSortKey === "function" ? model.alphaSortKey() : void 0) || model.get('sortable_id');
        letter = key[0];
        if (/^\d$/.test(letter)) {
          return '0-9';
        } else {
          return letter.toUpperCase();
        }
      });
    },
    groupByAlphaWithColumns: function(numberOfColumns) {
      var instance, itemsByLetter, itemsToColumns, letters;
      if (numberOfColumns == null) {
        numberOfColumns = 3;
      }
      instance = new this.model();
      if (!_.isFunction(instance.href)) {
        throw "You must implement an `href` method for these models.";
      }
      if (!_.isFunction(instance.displayName)) {
        throw "You must implement a `displayName` method for these models.";
      }
      itemsByLetter = this.groupByAlpha();
      letters = _.keys(itemsByLetter);
      letters.sort();
      itemsToColumns = function(items, numberOfColumns) {
        var i, j, maxRows, ref, results;
        maxRows = Math.floor(items.length / numberOfColumns);
        results = [];
        for (i = j = 0, ref = numberOfColumns; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(items.slice(i * maxRows + i, +((i + 1) * maxRows + i) + 1 || 9e9));
        }
        return results;
      };
      return _.map(letters, function(letter) {
        var items, models;
        models = itemsByLetter[letter];
        items = _.map(models, function(model) {
          var linkToPage;
          linkToPage = model.has('artworks_count') ? model.get('artworks_count') > 0 : true;
          return {
            href: model.href(),
            name: model.displayName(),
            linkToPage: linkToPage
          };
        });
        return {
          letter: letter,
          columns: itemsToColumns(items, numberOfColumns)
        };
      });
    }
  };

}).call(this);
