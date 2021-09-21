const _ = require('underscore');

module.exports = {

  //
  // Collection models must specify what to sort by through an `alphaSortKey` method
  // Sample output:
  // {
  //   '0-9': [ model_instance, model_instance, model_instance ],
  //   A: [ model_instance, model_instance, model_instance ],
  //   ...
  //   Z: [ model_instance, model_instance, model_instance ]
  // }
  groupByAlpha() {
    return this.groupBy(function (model) {
      const key = (typeof model.alphaSortKey === 'function' ? model.alphaSortKey() : undefined) || model.get('sortable_id');
      const letter = key[0];
      if (/^\d$/.test(letter)) {
        return '0-9';
      } else {
        return letter.toUpperCase();
      }
    });
  },

  //
  // Groups collection output in a format suitable for rendering in an A-Z list with
  // a specified number of columns.
  //
  // Sample Output:
  // [
  //  { letter: '0-9', columns: [ ... ] },
  //  { letter: 'A', columns: [ ... ] },
  //   ...
  //  { letter: 'Z', columns: [ ... ] }
  // ]
  // Each column is a 2D array of objects with `href`, and `name` properties:
  // columns: [
  //   [ { href: '...', name: '...' }, ... { href: '...', name: '...' } ],
  //   [ { href: '...', name: '...' }, ... { href: '...', name: '...' } ],
  //   [ { href: '...', name: '...' }, ... { href: '...', name: '...' } ]
  // ]
  groupByAlphaWithColumns(numberOfColumns) {
    if (numberOfColumns == null) {
      numberOfColumns = 3;
    }
    const instance = new this.model();
    if (!_.isFunction(instance.href)) {
      throw "You must implement an `href` method for these models.";
    }
    if (!_.isFunction(instance.displayName)) {
      throw "You must implement a `displayName` method for these models.";
    }

    const itemsByLetter = this.groupByAlpha();
    const letters = _.keys(itemsByLetter);
    letters.sort();

    const itemsToColumns = function (items, numberOfColumns) {
      const maxRows = Math.floor(items.length / numberOfColumns);
      return __range__(0, numberOfColumns, false).map((i) => items.slice(((i * maxRows) + i), +(((i + 1) * maxRows) + i) + 1 || undefined));
    };

    return _.map(letters, function (letter) {
      const models = itemsByLetter[letter];
      const items = _.map(models,
        function (model) {
          const linkToPage = model.has('artworks_count') ? model.get('artworks_count') > 0 : true;
          return {
            href: model.href(),
            name: model.displayName(),
            linkToPage
          };
        });
      return {
        letter,
        columns: itemsToColumns(items, numberOfColumns)
      };
    });
  }
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
