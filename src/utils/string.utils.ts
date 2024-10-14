import crypto from 'crypto';

export default class StringUtils {
  static get REGEX_EMAIL(): RegExp {
    return /^[\w-.]+@([\w-]+\.)+[\w-]+$/;
    // return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  }

  static get REGEX_MOBILE(): RegExp {
    return /^\d{10,15}$/;
  }

  public static isValidEmail(str: string, regex: RegExp): boolean {
    if (!str) return false;
    if (regex) return str !== '' && regex.test(str);
    return str !== '' && StringUtils.REGEX_EMAIL.test(str);
  }

  public static isValidMobile(str: string, regex: RegExp): boolean {
    if (!str) return false;
    if (regex) return str !== '' && regex.test(str);
    return str !== '' && StringUtils.REGEX_MOBILE.test(str);
  }

  public ucfirst(str: string): string {
    return !str ? str : str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * To Generate a Random Alphabetical String
   * for the given number of digits
   *
   * @param digits Number of digits to be generated
   */
  public generateRandomString(digits: number): string {
    // Set Default length of 10
    // if nothing provided
    if (digits < 1) digits = 10;
    // eslint-disable-next-line unicorn/prefer-string-slice
    return Math.random().toString(36).substring(2, digits);
  }

  /**
   * This function basically create a new string
   * with the help of given string
   *
   * @param str The String for which a new string has to be created
   */
  public async generateShaSum(str: string): Promise<string> {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
