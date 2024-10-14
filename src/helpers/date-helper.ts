import moment from 'moment-timezone';

export default class DateHelper {
  monthsName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  public toH2HDateString(date: Date): string {
    const rawDate = new Date(date);
    const dateString = rawDate.getDate().toString();
    let monthString = (rawDate.getMonth() + 1).toString();
    monthString = monthString.length === 1 ? '0' + monthString : monthString;
    const yearString = rawDate.getFullYear().toString();

    return dateString + monthString + yearString;
  }

  public toFrontendString(date: Date): string {
    const result = '';

    if (!date) {
      return result;
    }

    // result += (date.getDay() + date.getMonth() + );

    return result;
  }

  public getLastMonthsNames(num: number): string[] {
    // Get current month's number
    const currMonthIndex = new Date().getMonth();
    return this.monthsName.slice(currMonthIndex - num, currMonthIndex);
  }

  public getMonthName(num: number): string {
    return this.monthsName[num];
  }

  public parseToDate(dateStr: string): Date | undefined {
    if (!dateStr) return;

    return new Date(dateStr);
  }

  /**
   * To parse the given date string
   * with the given timezone in string format
   * and return the moment object for the same
   *
   * This return UTC formatted moment object
   *
   * @param dateStr
   * @param timezone
   */
  public parseByTimeZone(dateStr: string, timezone: string): moment.Moment {
    return moment(new Date(dateStr)).tz(timezone);
  }

  /**
   * Converts the given date object to given timezone
   * and return the UTC formatted timezone
   *
   * @param date
   * @param timezone
   */
  public convertToTimezone(date: Date, timezone: string): moment.Moment {
    return moment(date).tz(timezone);
  }

  /**
   * Returns number of days in the current month
   */
  public daysInThisMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  /**
   * Check if two dates fall in the same week
   * @returns boolean
   */
  public doesWeekMatch(dateA: Date, dateB: Date): boolean {
    const dateAMoment = moment(dateA);
    const dateBMoment = moment(dateB);

    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateAMoment.week() === dateBMoment.week()
    );
  }

  /**
   * Check if the month of two dates fall in same year
   * @returns boolean
   */
  public sameMonthYear(dateA: Date, dateB: Date): boolean {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth()
    );
  }

  /**
   * Convert dateFrom
   * @returns date
   */
  public dateFrom(date: string): Date {
    return new Date(date);
  }

  /**
   * Convert dateTo
   * @returns date
   */
  public dateTo(date: string): Date {
    return new Date(date);
  }
}
