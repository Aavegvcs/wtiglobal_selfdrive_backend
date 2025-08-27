import * as moment from 'moment-timezone';

function checkTime(i: any): any {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

export function timeStamp(): any {
  let date_ob = new Date();
  let date = ('0' + date_ob.getDate()).slice(-2);
  let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  hours = checkTime(hours);
  minutes = checkTime(minutes);
  seconds = checkTime(seconds);
  return (
    year +
    '-' +
    month +
    '-' +
    date +
    ' ' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds
  );
}

export function convertUtcToTimezone(
  utcTimestamp: string,
  targetTimezone: string,
): string {
  let dateTime: string | Array<string> = moment
    .utc(utcTimestamp)
    .tz(targetTimezone)
    .format('YYYY-MM-DD HH:mm:ss');
  dateTime = dateTime.split(' ');
  return `${dateTime[0]}, ${dateTime[1]}`;
}

export function makeTimeStampFromDateTime(
  dataFormat: {
    date: string;
    time: string;
  },
  timezone: string,
): string {
    
    const DateTime = `${dataFormat.date} ${dataFormat.time}`;

    // Parse with timezone, then convert to UTC
    const utcTimestamp = moment.tz(DateTime, "DD/MM/YYYY HH:mm", timezone).utc();
    
    console.log("utcTimestamp", utcTimestamp);

    return utcTimestamp.toISOString();
}

export function calculateDaysDifference(startDate: string, endDate: string): number{
    const sDate = moment.utc(startDate);
    const eDate = moment.utc(endDate);

    // Difference in days
    const diffInDays = eDate.diff(sDate, "days");

    console.log("Days difference:", diffInDays); // 1

    return diffInDays
}