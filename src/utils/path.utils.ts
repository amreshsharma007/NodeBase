export default class PathUtils {
  public static addSlashPrefix(input: string): string {
    return input ? ('/' + input).replaceAll('//', '/') : '';
  }

  public static prepare(...args: (string | undefined)[]): string {
    return this.addSlashPrefix(args.flatMap((f) => (f ? [f] : [])).join('/'));
  }
}
