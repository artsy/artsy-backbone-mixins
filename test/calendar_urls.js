const _ = require('underscore');
const Backbone = require('backbone');
const CalendarUrls = require('../lib/calendar_urls');

class Model extends Backbone.Model {
  preinitialize() {
    _.extend(this, CalendarUrls({
      address: 'venue_address',
      title: 'name'
    }));
  }
}

describe('calendarUrls Mixin', function () {
  let model;
  beforeEach(function () {
    model = new Model({
      name: "Art is Life",
      venue: "The Media Lounge on Pier 94",
      description: "Leading practitioners and thinkers come together to examine the latest trends.",
      venue_address: "711 12th Ave, New York, NY 10019",
      start_at: "2015-03-05T12:30:00+00:00",
      end_at: "2015-03-05T18:00:00+00:00"
    });
  });

  describe('helper methods', function () {
    describe('#calulateDurationTime', function () {
      it('calculate the correct duration time', function () {
        model.calulateDurationTime(model.get('end_at'), model.get('start_at')).should.eql(330);
      })
    });

    describe('#convertToYahooDuration', function () {
      it('convert duration into hhmm format', function () {
        model.convertToYahooDuration(model.get('end_at'), model.get('start_at')).should.eql('0530');
      })
    });

    describe('#formatTime', function () {
      it('formats time to YYYYMMDDT223000Z', function () {
        model.formatTime(model.get('start_at')).should.eql("20150305T123000");
      })
    });
  });

  describe('#googleCalendarUrl', function () {
    it('returns the url to create a google calendar event', function () {
      model.googleCalendarUrl().should.eql("https://www.google.com/calendar/render?action=TEMPLATE&text=Art%20is%20Life&dates=20150305T123000/20150305T180000&details=Leading%20practitioners%20and%20thinkers%20come%20together%20to%20examine%20the%20latest%20trends.&location=711%2012th%20Ave,%20New%20York,%20NY%2010019&sprop=&sprop=name:");
    })
  });

  describe('#yahooCalendarUrl', function () {
    it('returns the url to create a yahoo calendar event', function () {
      model.yahooCalendarUrl().should.eql("http://calendar.yahoo.com/?v=60&view=d&type=20&title=Art%20is%20Life&st=20150305T123000&dur=0530&desc=Leading%20practitioners%20and%20thinkers%20come%20together%20to%20examine%20the%20latest%20trends.&in_loc=711%2012th%20Ave,%20New%20York,%20NY%2010019");
    })
  });

  describe('#isc', function () {
    it('returns the url to create ical and outlook calendar events', function () {
      model.icsCalendarUrl().should.containEql("BEGIN:VEVENT");
    })
  });
});
