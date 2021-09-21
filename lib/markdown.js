const _ = require('underscore');
const marked = require('marked');
const renderer = new marked.Renderer;

const stripTags = function (str) {
  if (str == null) {
    return '';
  }
  return String(str).replace(/<\/?[^>]+>/g, '');
};

module.exports = {
  mdToHtml(attr, options) {
    if (options == null) {
      options = {};
    }
    marked.setOptions(_.defaults(options, {
      renderer,
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: true,
      smartypants: false
    }));
    return marked(this.get(attr) || '');
  },

  mdToHtmlToText(attr) {
    return stripTags(this.mdToHtml(attr, {
      sanitize: false
    }));
  },

  htmlToText(attr) {
    return stripTags(this.get(attr));
  }
};
