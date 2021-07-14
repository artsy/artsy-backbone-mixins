const _ = require('underscore');
const Backbone = require('backbone');
const ArtworkHelpers = require('../lib/artwork_helpers');

describe('ArtworkHelpers Mixin', function () {

  let artwork;
  beforeEach(function () {

    class Artwork extends Backbone.Model {
      preinitialize() {
        _.extend(this, ArtworkHelpers);
      }
    }

    artwork = new Artwork({
      comparables_count: 2,
      category: 'Painting',
      price: 'exists',
      edition_sets: 0,
      inquireable: true,
      partner: 'exists',
      sold: false,
      forsale: true
    });
  });

  describe("#artwork", function () {

    it('can check if comparable', function () {
      artwork.isComparable().should.equal.true;
      artwork.set('category', 'Architecture');
      artwork.isComparable().should.equal.false;
    });

    it('can check if artwork price is displayable', function () {
      artwork.isPriceDisplayable().should.equal(true);
      artwork.set('sale_message', 'Contact For Price');
      artwork.isPriceDisplayable().should.equal(false);
    });

    it('can check if artwork is unavailable but inquireable', function () {
      artwork.isUnavailableButInquireable().should.equal(false);
    });

    it('can check if artwork is contactable', function () {
      artwork.isContactable().should.equal(true);
    });

    it('can check if artwork has multiple editions', function () {
      artwork.isMultipleEditions().should.equal(false);
    });
  });

  describe('#imageUrl', function () {

    beforeEach(function () {
      this.images = [{
        "id": "4e68f259528702000104c329",
        "position": 1,
        "aspect_ratio": 1.14,
        "downloadable": false,
        "original_height": 1050,
        "original_width": 1198,
        "is_default": true,
        "image_filename": "original.jpg",
        "image_versions": [
          "large",
          "large_rectangle",
          "larger",
          "medium",
          "medium_rectangle",
          "normalized",
          "small",
          "square",
          "tall"
        ],
        "image_url": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/:version.jpg",
        "image_urls": {
          "large": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/large.jpg",
          "large_rectangle": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/large_rectangle.jpg",
          "larger": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/larger.jpg",
          "medium": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/medium.jpg",
          "medium_rectangle": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/medium_rectangle.jpg",
          "normalized": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/normalized.jpg",
          "small": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/small.jpg",
          "square": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/square.jpg",
          "tall": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/tall.jpg"
        },
        "tile_size": 512,
        "tile_overlap": 0,
        "tile_format": "jpg",
        "tile_base_url": "https://d32dm0rphc51dk.cloudfront.net/vAYXuDl0rYz7QR0Jx4MK2Q/dztiles",
        "max_tiled_height": 1050,
        "max_tiled_width": 1198,
        "skip_watermark": false
      }];
    });

    it('finds the image url from image_urls', function () {
      artwork.set({
        images: this.images
      });
      artwork.imageUrl().should.containEql('larger.jpg');
    });

    it('finds the image url from image_urls despite missing version', function () {
      artwork.set({
        images: this.images
      });
      artwork.imageUrl('foobar').should.containEql('large.jpg');
    });

    it('finds the url even if missing the newer image_urls', function () {
      const img = this.images[0];
      img.image_urls = null;
      artwork.set({
        images: [img]
      });
      artwork.imageUrl().should.containEql('large.jpg');
    });

    it('finds the url even if missing the newer image_urls and version', function () {
      const img = this.images[0];
      img.image_urls = null;
      artwork.set({
        images: [img]
      });
      artwork.imageUrl('foobar').should.containEql('large.jpg');
    });

    it('finds the default image url', function () {
      const img = this.images[0];
      const img2 = _.clone(img);
      img.is_default = false;
      img.image_urls.larger = 'foo';
      img2.is_default = true;
      img.image_urls.larger = 'bar';
      artwork.set({
        images: [img, img2]
      });
      artwork.imageUrl().should.containEql('bar');
    });
  });
});
