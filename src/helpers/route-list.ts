// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AsciiTable from 'ascii-table';
import {Express} from 'express-serve-static-core';

interface URIItem {
    method: string;
    URI: string;
}

class RoutesList {
    public static data = [] as URIItem[];
    public static table = {} as typeof AsciiTable;

    public static terminal = function (app: Express): void {
        RoutesList.table = new AsciiTable('List All Routes Endpoints');
        RoutesList.table.setHeading('Method', 'URI');
        // eslint-disable-next-line unicorn/no-array-for-each,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line unicorn/no-array-for-each
        app._router.stack.forEach(RoutesList.print.bind(undefined, []));

        // Filter unique endpoints
        RoutesList.data = RoutesList.data.filter(
            (value: URIItem, index, self) =>
                index ===
                self.findIndex(
                    (t: URIItem) => t.method === value.method && t.URI === value.URI
                )
        );

        // Sort the data
        RoutesList.data = RoutesList.data.sort((a: URIItem, b: URIItem) => {
            return a.URI.localeCompare(b.URI);
        });

        // Assign the data to table row
        for (const item of RoutesList.data) {
            RoutesList.table.addRow(item.method, item.URI);
        }

        // Print the Log
        // eslint-disable-next-line no-console
        console.log(RoutesList.table.toString());
    };

    public static web = function (app: Express, path: string): void {
        // eslint-disable-next-line unicorn/no-array-for-each,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line unicorn/no-array-for-each
        app._router.stack.forEach(RoutesList.print.bind(undefined, []));

        // Filter unique endpoints
        RoutesList.data = RoutesList.data.filter(
            (value: { method: string; URI: string }, index, self) =>
                index ===
                self.findIndex(
                    (t: { method: string; URI: string }) =>
                        t.method === value.method && t.URI === value.URI
                )
        );

        let table =
            '<!DOCTYPE html>\n    <html lang="en">\n    <head>\n    <style>\n    body{\n      width:75%;\n      margin: 0 auto;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n   \n    table, th, td {\n      border: 1px solid #dee2e6;\n      border-collapse: collapse;\n    }\n    th, td {\n      padding: 15px;\n      text-align: left;\n    }\n    table{\n      width:"100%"\n    } \n    th{\n      font-size: 18px;\n      color: #fff;\n      font-weight:"bold";\n      line-height: 1.4;\n      background-color: #343a40;\n    }\n    .text-center{\n      text-align:center;\n    }    \n    </style><title></title>\n    </head>\n    <body>\n    <h1 class="text-center">List of Routes</h1>\n    <table style="width:100%">\n    <thead>\n    <tr>\n    <th class="text-center" align="center">#</th>\n    <th align="center">METHOD</th>\n    <th align="center">URI</th>\n    </tr>\n    </thead>\n    <tbody>\n    ';
        for (const [index, item] of RoutesList.data.entries()) {
            table +=
                '<tr><td class="text-center">' +
                (index + 1) +
                '</td><td>' +
                item.method +
                '</td><td>' +
                item.URI +
                '</td></tr>';
        }
        table += '</tbody></table></body></html>';
        app.get(path, function (req, res) {
            res.send(table);
        });
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public static print = function (path: string, layer): void {
        if (layer.route) {
            // eslint-disable-next-line unicorn/no-array-for-each
            layer.route.stack.forEach(
                RoutesList.print.bind(
                    undefined,
                    path.concat(RoutesList.split(layer.route.path))
                )
            );
        } else if (layer.name === 'router' && layer.handle.stack) {
            // eslint-disable-next-line unicorn/no-array-for-each
            layer.handle.stack.forEach(
                RoutesList.print.bind(
                    undefined,
                    path.concat(RoutesList.split(layer.regexp))
                )
            );
        } else if (layer.method) {
            const item = {
                method: layer.method.toUpperCase(),
                URI: [...path, ...RoutesList.split(layer.regexp)]
                    .filter(Boolean)
                    .join('/'),
            };
            RoutesList.data.push(item);
        }
    };

    // @ts-ignore
    public static split = function (thing) {
        if (typeof thing === 'string') {
            return thing.split('/');
        } else if (thing.fast_slash) {
            return '';
        } else {
            const match = thing
                .toString()
                .replace('\\/?', '')
                .replace('(?=\\/|$)', '$')
                .match(/^\/\^((?:\\[$()*+./?[\\\]^{|}]|[^$()*+./?[\\\]^{|}])*)\$\//);
            return match
                ? match[1].replace(/\\(.)/g, '$1').split('/')
                : '<complex:' + thing.toString() + '>';
        }
    };
}

export default RoutesList;
