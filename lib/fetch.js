const _ = require('underscore');
const Qs = require('qs');
const Backbone = require('backbone');

let ARTSY_URL = '';

module.exports = function (a) {
  ARTSY_URL = a;
  return module.exports.methods;
};

module.exports.methods = {

  // For paginated routes, this will recursively fetch until the end of the set.
  //
  // @param {Object} options Backbone sync options like `success` and `error`

  fetchUntilEnd(options) {
    if (options == null) {
      options = {};
    }
    let page = ((options.data != null ? options.data.page : undefined) - 1) || 0;
    const opts = _.clone(options);
    var fetchPage = () => {
      return this.fetch(_.extend(opts, {
        data: _.extend((opts.data != null ? opts.data : {}), {
          page: (page += 1)
        }),
        remove: false,
        complete() {},
        success: (col, res) => {
          if (typeof options.each === 'function') {
            options.each(col, res);
          }
          if (res.length === 0) {
            if (typeof options.success === 'function') {
              options.success(this);
            }
            return (typeof options.complete === 'function' ? options.complete(this) : undefined);
          } else {
            return fetchPage();
          }
        },
        error() {
          if (typeof options.error === 'function') {
            options.error(...arguments);
          }
          return (typeof options.complete === 'function' ? options.complete() : undefined);
        }
      }));
    };
    return fetchPage();
  },

  // Fetches a set by key and populates the collection with the first result.
  //
  // @param {String} key
  // @param {Object} options Backbone sync options like `success` and `error`

  fetchSetItemsByKey(key, options) {
    if (options == null) {
      options = {};
    }
    return new Backbone.Collection(null).fetch({
      url: `${ARTSY_URL}/api/v1/sets?key=${key}`,
      cache: options.cache,
      success: sets => {
        if (!sets.length) {
          return options.success(this);
        }
        return new Backbone.Collection(null).fetch({
          url: `${ARTSY_URL}/api/v1/set/${sets.first().get('id')}/items`,
          cache: options.cache,
          success: col => {
            this.reset(col.toJSON());
            return options.success(this);
          },
          error: options.error
        });
      },
      error: options.error
    });
  },

  // For paginated routes, this will fetch the first page along with the total count
  // then fetch every remaining page in parallel
  //
  // @param {Object} options Backbone sync options like `success` and `error`

  fetchUntilEndInParallel(options) {
    if (options == null) {
      options = {};
    }
    return new Promise((resolve, reject) => {
      const {
        success,
        error
      } = options; // Pull out original success and error callbacks

      const {
        size
      } = (options.data = _.defaults((options.data || {}), {
        total_count: 1,
        size: 10
      }));

      options.remove = false;

      options.data = decodeURIComponent(Qs.stringify(options.data, {
        arrayFormat: 'brackets'
      }));

      options.error = function () {
        reject(...arguments);
        return (typeof error === 'function' ? error(...arguments) : undefined);
      };

      options.success = (collection, response, opts) => {
        let total = 0;
        if (opts && opts.res && opts.res.headers && opts.res.headers['x-total-count']) {
          total = parseInt(opts.res.headers['x-total-count'])
        } else if (opts && opts.xhr && typeof opts.xhr.getResponseHeader === 'function'){
          total = parseInt(opts.xhr.getResponseHeader('X-Total-Count'))
        }

        if (response.length >= total) { // Return if already at the end or no total
          resolve(this);
          return (typeof success === 'function' ? success(this) : undefined);
        } else {

          options.data = Qs.parse(options.data);

          const remaining = Math.ceil(total / size) - 1;

          return Promise.allSettled(_.times(remaining, n => {
            // if stringify flag is passed, convert the data object into a query string
            // (stringify is used to keep params with arrays formated properly)
            let data = _.extend(_.omit(options.data, 'total_count'), {
              page: n + 2
            });
            data = decodeURIComponent(Qs.stringify(data, {
              arrayFormat: 'brackets'
            }));

            return this.fetch(_.extend(_.omit(options, 'success', 'error'), {
              data
            }));

          })).then(() => {
            resolve(this);
            return (typeof success === 'function' ? success(this, response, opts) : undefined);
          }, () => {
            reject(this);
            return (typeof error === 'function' ? error(this, response, opts) : undefined);
          });
        }
      };

      return this.fetch(options);
    });
  }
};
