const _ = require('underscore');
const sinon = require('sinon');
const Backbone = require('backbone');
const CurrentUser = require('../lib/current_user');

class User extends Backbone.Model {
  preinitialize() {
    _.extend(this, CurrentUser('http://artsy.net'));
  }
}

describe('CurrentUser Mixin', function () {

  beforeEach(function () {
    sinon.stub(Backbone, 'sync');
    this.user = new User;
  });

  afterEach(function () {
    Backbone.sync.restore()
  });

  describe("#unlinkAccount", function () {
    it('unlinks the user from a provider', function () {
      this.user.unlinkAccount('facebook');
      Backbone.sync.args[0][1].url.should.containEql('v1/me/authentications/facebook');
    })
  });

  describe('#sync', function () {

    it('adds the access token to data for fetches', function () {
      this.user.set({
        accessToken: 'foobarbaz'
      });
      this.user.fetch();
      Backbone.sync.args[0][2].data.access_token.should.equal('foobarbaz');
    });

    xit('adds the access token to attrs for saves', function () {
      this.user.set({
        accessToken: 'foobarbaz'
      });
      this.user.save();
      Backbone.sync.args[0][2].attrs;
    });
  });
});
