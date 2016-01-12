module.exports =
  formatTime = (date) ->
    new Date(date).toISOString().replace(/-|:|\.\d+/g, '')

  convertToDateTime = (dateInString) ->
    new Date(dateInString)

  googleCalendarUrl: ->
    startTime = formatTime(@get('start_at'))
    endTime = formatTime(@get('end_at'))

    href = encodeURI([
      'https://www.google.com/calendar/render',
      '?action=TEMPLATE',
      '&text=' + (@get('name') || ''),
      '&dates=' + (startTime || ''),
      '/' + (endTime || ''),
      '&details=' + (@get('description') || ''),
      '&location=' + (@get('venue_address') || ''),
      '&sprop=&sprop=name:'
    ].join(''));
    href

  yahooCalendarUrl: ->
    eventDuration = @get('end_at') ?
    ((convertToDateTime(@get'end_at').getTime() - convertToDateTime(@get('start_at')).getTime())/ (60 * 1000)) :
    event.duration

    # Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm
    yahooHourDuration = if eventDuration < 600 then '0' + Math.floor((eventDuration / 60)) else Math.floor((eventDuration / 60)) + ''

    yahooMinuteDuration = if eventDuration % 60 < 10 then '0' + eventDuration % 60 else
    eventDuration % 60 + ''

    yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

    # Remove timezone from event time
    st = formatTime(convertToDateTime(@get('start_at') - convertToDateTime((@get('start_at'))).getTimezoneOffset() *
      (60 * 1000))) || ''

    href = encodeURI([
      'http://calendar.yahoo.com/?v=60&view=d&type=20',
      '&title=' + (@get('name') || ''),
      '&st=' + st,
      '&dur=' + (yahooEventDuration || ''),
      '&desc=' + (@get.('description') || ''),
      '&in_loc=' + (@.get('venue_address') || '')
    ].join(''))

    href
