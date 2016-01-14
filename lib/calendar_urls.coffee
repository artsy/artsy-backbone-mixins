ADDRESS_ATTR = ''
TITLE_ATTR = ''

module.exports = ({ address, title }) ->
  ADDRESS_ATTR = address
  TITLE_ATTR = title
  module.exports.methods

module.exports.methods =
  formatTime: formatTime = (date) ->
    new Date(date).toISOString().replace(/-|:|\.\d+/g, '')

  calulateDurationTime: calulateDurationTime = (end, start) ->
    endTime = new Date(end).getTime()
    startTime = new Date(start).getTime()
    (endTime - startTime) / (60 * 1000)

  convertToYahooDuration: convertToYahooDuration = (end, start) ->
    eventDuration = calulateDurationTime(end, start)

    yahooHourDuration = if eventDuration < 600 then '0' + Math.floor((eventDuration / 60))
    else Math.floor((eventDuration / 60)) + ''

    if (eventDuration % 60) < 10
      yahooMinuteDuration = '0' + (eventDuration % 60)
    else
      yahooMinuteDuration = (eventDuration % 60) + ''

    yahooHourDuration + yahooMinuteDuration

  googleCalendarUrl: ->
    startTime = formatTime(@get('start_at'))
    endTime = formatTime(@get('end_at'))

    href = encodeURI([
      'https://www.google.com/calendar/render',
      '?action=TEMPLATE',
      '&text=' + (@get(TITLE_ATTR) || ''),
      '&dates=' + (startTime || ''),
      '/' + (endTime || ''),
      '&details=' + (@get('description') || ''),
      '&location=' + (@get(ADDRESS_ATTR) || ''),
      '&sprop=&sprop=name:'
    ].join(''));
    href

  yahooCalendarUrl: ->
    # Converts the duration from minutes to hh:mm
    yahooEventDuration = convertToYahooDuration(@get('end_at'), @get('start_at'))

    st =  new Date(@get('start_at')).toISOString().replace(/-|:|\.\d+/g, '')

    href = encodeURI([
      'http://calendar.yahoo.com/?v=60&view=d&type=20',
      '&title=' + (@get(TITLE_ATTR) || ''),
      '&st=' + st,
      '&dur=' + (yahooEventDuration || ''),
      '&desc=' + (@get('description') || ''),
      '&in_loc=' + (@get(ADDRESS_ATTR) || '')
    ].join(''))

    href

  ics: (event) ->
    startTime = formatTime(@get('start_at'))
    endTime = formatTime(@get('end_at'))

    data = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:' + (startTime || ''),
      'DTEND:' + (endTime || ''),
      'SUMMARY:' + (@get(TITLE_ATTR) || ''),
      'DESCRIPTION:' + (@get('description') || ''),
      'LOCATION:' + (@get(ADDRESS_ATTR) || ''),
      'END:VEVENT',
      'END:VCALENDAR'].join('\n');

    data = 'data:text/calendar;charset=utf8,' + data

    href = encodeURI(data)
    href
