const _ = require('underscore');
const Backbone = require('backbone');

let API_URL = '';
let Sale = '';
let Artworks = '';
let FeaturedSet = '';
let FeaturedLinks = '';

module.exports = function (a, b, c, d, e) {
  API_URL = a;
  Sale = b;
  Artworks = c;
  FeaturedSet = d;
  FeaturedLinks = e;
  return module.exports.methods;
};

//
// Mixins for the feature page so we can at least keep them consistent across microgravity and force
module.exports.methods = {

  // Goes down the rabbit hole of APIs necessary to retrieve the data needed to render a
  // feature. Returns an Array of hashes describing these items such as a collection
  // of artworks from a sale, or a collection of featured links. And example would look like:
  //
  // [
  //   {
  //     type: 'sale artworks',
  //     data: Backbone Collection of artworks
  //   },
  //   {
  //     type: 'featured links',
  //     data: Backbone Collection of featured links
  //   }
  // ]
  //
  // Currently the types are:
  //   * "sale artworks"    Artworks collection
  //   * "featured links"   FeaturedLinks collection
  //   * "auction artworks" Artworks collection from an auction
  //   * "videos"           Like a featured link with videos instead of an images
  //
  // @param {Object} options Provide `success` and `error` callbacks similar to Backbone's fetch
  // @return {Array} An array `Set`s

  fetchSets(options) {
    if (options == null) {
      options = {};
    }
    return this.fetchSetsAndItems({
      success: setItems => {
        // Now that we know how many items need to be mapped, create a callback for those items
        // that need even further data fetched such as a sale's artworks.
        const allItemsLen = _.flatten(_.pluck(setItems, 'item')).length;
        let err = null;
        const callback = _.after(allItemsLen, () => {
          if (err) {
            return options.error(err);
          }
          return (typeof options.success === 'function' ? options.success(sets || this.setsFromSetItems(setItems)) : undefined);
        });

        for (let {
            orderedSet,
            items
          } of Array.from(setItems)) {
          var sale;
          if (!items.length || !orderedSet.get('display_on_desktop')) {
            callback();
            continue;
          }

          switch (orderedSet.get('item_type')) {
            case 'FeaturedLink':
              orderedSet.set({
                data: items,
                type: 'featured links'
              });
              callback();
              break;

            case 'Sale':
              // We're going to assume we wouldn't stack multiple sales next to each other
              // because that would be silly. So we'll just use the first item.
              // Set it on the feature for convenience.
              orderedSet.set({
                type: 'artworks'
              });

              this.set({
                sale: (sale = new Sale(items.first().toJSON()))
              });
              sale.fetchArtworks({
                each: options.artworkPageSuccess,
                success: _.bind((function (orderedSet, saleArtworks) {
                  orderedSet.set({
                    data: Artworks.fromSale(saleArtworks),
                    display_artist_list: sale.get('display_artist_list')
                  });
                  if (typeof options.artworksSuccess === 'function') {
                    options.artworksSuccess(orderedSet);
                  }
                  return callback();
                }), this, orderedSet),
                error(e) {
                  err = e;
                  return callback();
                }
              });
              break;
            default:
              callback();
          }
        }

        var sets = this.setsFromSetItems(setItems);
        return (typeof options.setsSuccess === 'function' ? options.setsSuccess(sets) : undefined);
      },

      error: options.error
    });
  },

  setsFromSetItems(setItems) {
    return _.sortBy(_.pluck(setItems, 'orderedSet'), set => set.get('key'));
  },

  // Fetches all sets and their items for the mixed-in model. Returns an array of hashes containing
  // the set data and the items from the set.
  //
  // [{
  //   set: new FeaturedSet()
  //   items: new FeaturedLinks()
  // }]
  //
  // @param {Object} options Provide `success` and `error` callbacks similar to Backbone's fetch

  fetchSetsAndItems(options) {
    const finalHashes = [];
    const sets = new Backbone.Collection([], {
      model: FeaturedSet
    });
    sets.url = `${API_URL}/api/v1/sets`;
    return sets.fetch({
      data: {
        owner_type: 'Feature',
        owner_id: this.get('id'),
        size: 50
      },
      success: sets => {
        let err = null;
        const success = _.after(sets.length, function () {
          if (err) {
            return options.error(err);
          }
          return options.success(finalHashes);
        });

        const error = function (e) {
          err = e;
          return success();
        };

        return Array.from(sets.models).map((orderedSet) =>
          this.fetchSet(orderedSet, sets, finalHashes, success, error));
      }
    });
  },

  fetchSet(orderedSet, orderedSets, finalHashes, success, error) {
    let method, setItems;
    const itemType = orderedSet.get('item_type');
    const id = orderedSet.get('id');

    if (itemType === 'FeaturedLink') {
      setItems = new FeaturedLinks([]);
      method = 'fetchUntilEnd';
    } else {
      setItems = new Backbone.Collection([]);
      method = 'fetch';
    }
    setItems.url = `${API_URL}/api/v1/set/${id}/items`;
    setItems.id = id;
    return setItems[method]({
      success(items) {
        const set = orderedSets.get(items.id);
        items = itemType === 'FeaturedLink' ? new FeaturedLinks(items.toJSON()) : items;
        finalHashes.push({
          orderedSet: set,
          items
        });
        return success();
      },
      error(m, e) {
        return error(e);
      }
    });
  }

};
