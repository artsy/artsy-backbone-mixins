/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore');
const Backbone = require('backbone');
const markdown = require('../lib/markdown');

class Model extends Backbone.Model {
  static initClass() {
    _.extend(this.prototype, markdown);
  }
}
Model.initClass();

describe('Dimensions Mixin', function () {
  beforeEach(function () {
    return this.model = new Model;
  });

  describe('#mdToHtml', function () {
    it('returns HTML from parsed markdown', function () {
      this.model.set({
        foo: "**foo** *bar*"
      });
      return this.model.mdToHtml('foo').should.eql('<p><strong>foo</strong> <em>bar</em></p>\n');
    });

    it('is defensive about missing data', function () {
      this.model.set({
        foo: null
      });
      return this.model.mdToHtml('foo').should.equal('');
    });

    it('is defensive about XSS', function () {
      // The next line must end with a single trailing space
      this.model.set({
        foo: "<img src=<script> src='<img<script>alert(document.domain)//</p> " + `\
</script>`
      });
      return this.model.mdToHtml('foo').should.equal('<p>&lt;img src=&lt;script&gt; src=&#39;&lt;img&lt;script&gt;alert(document.domain)//&lt;/p&gt; &lt;/script&gt;</p>\n');
    });

    return it('is configurable to allow HTML through desireable', function () {
      this.model.set({
        foo: '<iframe src="https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4" width="1100" height="733"></iframe>'
      });
      this.model.mdToHtml('foo').should.equal('<p>&lt;iframe src=&quot;<a href="https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4">https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4</a>&quot; width=&quot;1100&quot; height=&quot;733&quot;&gt;&lt;/iframe&gt;</p>\n');
      return this.model.mdToHtml('foo', {
        sanitize: false
      }).should.equal('<iframe src="https://mapsengine.google.com/map/u/0/embed?mid=zJZQ9AwtKFhA.kxtTsvo5bMR4" width="1100" height="733"></iframe>');
    });
  });

  describe('#mdToHtmlToText', function () {
    it('strips markdown-generated HTML tags', function () {
      this.model.set({
        foo: '*bold text*'
      });
      return this.model.mdToHtmlToText('foo').trim().should.equal('bold text');
    });

    return it('strips literal HTML tags', function () {
      this.model.set({
        foo: '<b>bold text</b>'
      });
      return this.model.mdToHtmlToText('foo').trim().should.equal('bold text');
    });
  });

  return describe('#htmlToText', function () {
    it('handles null input', function () {
      this.model.set({
        foo: null
      });
      return this.model.htmlToText('foo').should.equal('');
    });

    return it('strips tags', function () {
      this.model.set({
        foo: '<p><strong>Obviously</strong> works</p>.'
      });
      return this.model.htmlToText('foo').should.equal('Obviously works.');
    });
  });
});
