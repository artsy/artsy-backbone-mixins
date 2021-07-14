let calulateDurationTime, convertToYahooDuration, formatTime;
let ADDRESS_ATTR = '';
let TITLE_ATTR = '';

module.exports = function ({
  address,
  title
}) {
  ADDRESS_ATTR = address;
  TITLE_ATTR = title;
  return module.exports.methods;
};

module.exports.methods = {
  formatTime: (formatTime = date => new Date(date).toISOString().replace(/-|:|Z|\.\d+/g, '')),

  calulateDurationTime: (calulateDurationTime = function (end, start) {
    const endTime = new Date(end).getTime();
    const startTime = new Date(start).getTime();
    return (endTime - startTime) / (60 * 1000);
  }),

  convertToYahooDuration: (convertToYahooDuration = function (end, start) {
    let yahooMinuteDuration;
    const eventDuration = calulateDurationTime(end, start);

    const yahooHourDuration = eventDuration < 600 ? '0' + Math.floor((eventDuration / 60)) :
      Math.floor((eventDuration / 60)) + '';

    if ((eventDuration % 60) < 10) {
      yahooMinuteDuration = '0' + (eventDuration % 60);
    } else {
      yahooMinuteDuration = (eventDuration % 60) + '';
    }

    return yahooHourDuration + yahooMinuteDuration;
  }),

  googleCalendarUrl() {
    const startTime = formatTime(this.get('start_at'));
    const endTime = formatTime(this.get('end_at'));

    const href = encodeURI([
      'https://www.google.com/calendar/render',
      '?action=TEMPLATE',
      '&text=' + (this.get(TITLE_ATTR) || ''),
      '&dates=' + (startTime || ''),
      '/' + (endTime || ''),
      '&details=' + (this.get('description') || ''),
      '&location=' + (this.get(ADDRESS_ATTR) || ''),
      '&sprop=&sprop=name:'
    ].join(''));
    return href;
  },

  yahooCalendarUrl() {
    // Converts the duration from minutes to hh:mm
    const yahooEventDuration = convertToYahooDuration(this.get('end_at'), this.get('start_at'));

    const st = formatTime(this.get('start_at'));

    const href = encodeURI([
      'http://calendar.yahoo.com/?v=60&view=d&type=20',
      '&title=' + (this.get(TITLE_ATTR) || ''),
      '&st=' + st,
      '&dur=' + (yahooEventDuration || ''),
      '&desc=' + (this.get('description') || ''),
      '&in_loc=' + (this.get(ADDRESS_ATTR) || '')
    ].join(''));

    return href;
  },

  icsCalendarData() {
    const startTime = formatTime(this.get('start_at'));
    const endTime = formatTime(this.get('end_at'));
    const description = this.get('description') ? this.get('description').replace(/(\r\n|\n|\r)/gm, "") : undefined;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DSSTAMP:' + (new Date().toISOString().replace(/-|:|\.\d+/g, '')),
      'DTSTART:' + (startTime || ''),
      'DTEND:' + (endTime || ''),
      'SUMMARY:' + (this.get(TITLE_ATTR) || ''),
      'DESCRIPTION:' + (description || ''),
      'LOCATION:' + (this.get(ADDRESS_ATTR) || ''),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
  },

  icsCalendarUrl() {
    const data = 'data:text/calendar;charset=utf8,' + this.icsCalendarData();
    return encodeURI(data);
  }
};
