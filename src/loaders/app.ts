import cluster, {Worker} from 'node:cluster';
import express, {Application} from 'express';
import routeList from '../helpers/route-list';
import winston from 'winston';
import ExceptionMonitorService from '../services/exception-monitor.service';

interface opts {
    port: number;
    logger: winston.Logger;
    logRoutes: boolean;
    enableCluster: boolean;
    exceptionMonitor?: ExceptionMonitorService;
    before: (server: Application) => Promise<void>;
    after?: (server: Application) => Promise<void>;
}

async function startServer(opts: opts): Promise<void> {
    const server = express();

    /**
     * A little hack here
     * Import/Export can only be used in 'top-level code'
     * Well, at least in node 10 without babel and at the time of writing
     * So we are using good old require.
     **/
    await opts.before(server);

    server
        .listen(opts.port, (): void => {
            opts.logger?.info(`

      ###############################################################
      🛡️  Server listening on port: ${opts.port} 🛡️
      🛡️
      🛡️  Links Configured
      🛡️  ENV: ${process.env.NODE_ENV}
      🛡️  MongoDB: ${process.env.MONGODB_URI}
      ###############################################################

    `);

            // To Print All the routes
            if (opts.logRoutes) {
                routeList.terminal(server);
            }
        })
        .on('error', (err: Error): void => {
            opts.logger?.error(err);
            opts.logger?.info('Exception monitor in server on error');
            opts.exceptionMonitor?.send(err);
            process.exit(1);
        });

    // Listen for misc crash
    opts.exceptionMonitor?.listen();
}

async function startApplication(opts: opts): Promise<void> {
    if (!opts.enableCluster) {
        return startServer(opts);
    }

    let cCPUs = require('node:os').cpus().length;
    // - Number.parseInt(Process.env.CLUSTER_LEAVE_NUM_CORE);

    if (cCPUs < 1) {
        cCPUs++;
    }

    if (cluster.isPrimary) {
        // Create a worker for each CPU
        for (let i = 0; i < cCPUs; i++) {
            cluster.fork();
        }

        cluster.on('online', function (worker: Worker): void {
            opts.logger?.info('Worker ' + worker.process.pid + ' is online.');
        });

        cluster.on('exit', (worker: Worker, code: number, signal: string): void => {
            opts.logger?.info(
                `worker ${worker.process.pid} died, with code: ${code}`
            );
            cluster.fork();
        });
    } else {
        await startServer(opts);
    }
}

export default startApplication;
