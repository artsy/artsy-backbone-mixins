_ = require 'underscore'
sinon = require 'sinon'
Backbone = require 'backbone'
CalendarUrls = require '../lib/calendar_urls'

class Model extends Backbone.Model
  _.extend @prototype, CalendarUrls({ address_attr: 'venue_address', title_attr: 'name' })

describe 'calendarUrls Mixin', ->
  beforeEach ->
    @model = new Model
      name: "Art is Life"
      venue: "The Media Lounge on Pier 94"
      description: "Leading practitioners and thinkers come together to examine the latest trends."
      venue_address: "711 12th Ave, New York, NY 10019"
      start_at: "2015-03-05T12:30:00+00:00"
      end_at: "2015-03-05T18:00:00+00:00"

  describe 'helper methods', ->
    describe '#calulateDurationTime', ->
      it 'calculate the correct duration time', ->
        @model.calulateDurationTime(@model.get('end_at'), @model.get('start_at')).should.eql 330

    describe '#convertToYahooDuration', ->
      it 'convert duration into hhmm format', ->
        @model.convertToYahooDuration(@model.get('end_at'), @model.get('start_at')).should.eql '0530'

    describe '#formatTime', ->
      it 'formats time to YYYYMMDDT223000Z', ->
        @model.formatTime(@model.get('start_at')).should.eql "20150305T123000Z"

  describe '#googleCalendarUrl', ->
    it 'returns the url to create a google calendar event', ->
      @model.googleCalendarUrl().should.eql "https://www.google.com/calendar/render?action=TEMPLATE&text=Art%20is%20Life&dates=20150305T123000Z/20150305T180000Z&details=Leading%20practitioners%20and%20thinkers%20come%20together%20to%20examine%20the%20latest%20trends.&location=711%2012th%20Ave,%20New%20York,%20NY%2010019&sprop=&sprop=name:"

  describe '#yahooCalendarUrl', ->
    it 'returns the url to create a yahoo calendar event', ->
      @model.yahooCalendarUrl().should.eql "http://calendar.yahoo.com/?v=60&view=d&type=20&title=Art%20is%20Life&st=20150305T123000Z&dur=0530&desc=Leading%20practitioners%20and%20thinkers%20come%20together%20to%20examine%20the%20latest%20trends.&in_loc=711%2012th%20Ave,%20New%20York,%20NY%2010019"

  describe '#isc', ->
    it 'returns the url to create ical and outlook calendar events', ->
      @model.ics().should.eql 'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20150305T123000Z%0ADTEND:20150305T180000Z%0ASUMMARY:Art%20is%20Life%0ADESCRIPTION:Leading%20practitioners%20and%20thinkers%20come%20together%20to%20examine%20the%20latest%20trends.%0ALOCATION:711%2012th%20Ave,%20New%20York,%20NY%2010019%0AEND:VEVENT%0AEND:VCALENDAR'
