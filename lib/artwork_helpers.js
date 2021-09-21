const _ = require('underscore');

module.exports = {

  // Returns the best image url it can find for the index and size.
  //
  // param {String} version
  // param {Number} i
  // return {String}
  imageUrl(version, i) {
    let img, v;
    if (version == null) {
      version = 'larger';
    }
    const imgs = this.get('images');
    if (!(imgs != null ? imgs.length : undefined)) {
      return;
    }
    if (i) {
      img = _.findWhere(imgs, {
        position: i
      }) || imgs[i] || imgs[0];
    } else {
      img = _.findWhere(imgs, {
        is_default: true
      }) || imgs[0];
    }
    if (!img) {
      return;
    }
    let url = img.image_urls != null ? img.image_urls[version] : undefined;
    if (v = img.image_versions != null ? img.image_versions[version] : undefined) {
      if (!url) {
        url = img.image_url != null ? img.image_url.replace(':version', v) : undefined;
      }
    }
    if (!url) {
      url = _.values(img.image_urls)[0];
    }
    if (!url) {
      url = img.image_url != null ? img.image_url.replace(':version', _.first(img.image_versions)) : undefined;
    }
    return url;
  },

  // Are there comparable artworks;
  // such that we can display a link to auction results
  //
  // return {Boolean}
  isComparable() {
    return (this.get('comparables_count') > 0) && (this.get('category') !== 'Architecture');
  },

  // Can we display a price?
  //
  // return {Boolean}
  isPriceDisplayable() {
    return (this.has('price')) &&
      !this.isMultipleEditions() &&
      (this.get('inquireable') || this.get('sold')) &&
      !this.isUnavailableButInquireable() &&
      (this.get('sale_message') !== 'Contact For Price');
  },

  // Should we include a button to contact the partner?
  //
  // return {Boolean}
  isContactable() {
    return this.get('forsale') && this.has('partner') && !this.get('acquireable');
  },

  // Should we render a full set of editions,
  // as opposed to a single string? (See: #editionStatus)
  //
  // return {Boolean}
  isMultipleEditions() {
    if (!this.get('edition_sets')) {
      return false
    }
    return this.get('edition_sets').length > 1;
  },

  // The work is not for sale but a buyer may be interested
  // in related works
  //
  // return {Boolean}
  isUnavailableButInquireable() {
    return !this.get('forsale') && this.get('inquireable') && !this.get('sold');
  }

};
