const _ = require('underscore');
const Backbone = require('backbone');

let ARTSY_URL = '';

module.exports = function (a) {
  ARTSY_URL = a;
  return module.exports.methods;
};

module.exports.methods = {

  // Unlink a Social account like Facebook or Twitter
  unlinkAccount(provider, options) {
    const m = new Backbone.Model({
      id: 1
    });
    m.url = `${ARTSY_URL}/api/v1/me/authentications/${provider}`;
    m.destroy(options);
    return m.once('sync', () => {
      if (!this.get('authentications')) {
        return;
      }
      return this.set({
        authentications: _.reject(this.get('authentications'))
      }, auth => auth.provider === provider);
    });
  },

  // Add the access token to fetches and saves
  sync(method, model, options) {
    if (options == null) {
      options = {};
    }
    if (['create', 'update', 'patch'].includes(method)) {
      // If persisting to the server overwrite attrs
      options.attrs = _.omit(this.toJSON(), 'accessToken');
    } else {
      // Otherwise overwrite data
      _.defaults(options, {
        data: {
          access_token: this.get('accessToken')
        }
      });
    }
    return Backbone.Model.prototype.sync.call(this, ...arguments);
  }
};
