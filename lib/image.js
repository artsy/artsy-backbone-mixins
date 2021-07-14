const _ = require('underscore');

module.exports = function (secureImagesUrl, imagesUrlPrefix) {
  if (imagesUrlPrefix == null) {
    imagesUrlPrefix = 'http://static%d.artsy.net';
  }
  return {

    defaultImageVersion() {
      if (this.has('image_versions' || this.has('versions'))) {
        return (this.get('image_versions') || this.get('versions'))[0];
      } else {
        return null;
      }
    },

    missingImageUrl() {
      return "/images/missing_image.png";
    },

    hasImage(version) {
      return _.contains(this.get('image_versions'), version) ||
        _.contains(this.get('versions'), version) ||
        (version === 'original');
    },

    imageUrl(version) {
      if (version == null) {
        version = this.defaultImageVersion();
      }
      if (this.hasImage(version)) {
        return this.sslUrl(this.get('image_url').replace(':version', version));
      } else if (this.get('image_versions') && this.get('image_versions').length) {
        return this.sslUrl(this.get('image_url').replace(':version', this.get('image_versions')[0]));
      } else {
        return this.missingImageUrl();
      }
    },

    bestImageUrl(versions) {
      if (versions == null) {
        versions = [];
      }
      for (let version of Array.from(versions)) {
        if (this.hasImage(version)) {
          return this.imageUrl(version);
        }
      }
      return this.imageUrl();
    }, // default or missing image

    // Replace the image URL with an https:// URL
    sslUrl(url) {
      if (!secureImagesUrl || !imagesUrlPrefix) {
        return url;
      }

      if (this.imagesUrlPrefixRE == null) {
        this.imagesUrlPrefixRE = new RegExp(imagesUrlPrefix.replace('%d', '\\d'));
      }
      return url.replace(this.imagesUrlPrefixRE, secureImagesUrl);
    }
  };
};
