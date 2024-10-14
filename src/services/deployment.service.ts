// import fs from 'node:fs';
// import ConfigParser from '@webantic/nginx-config-parser';
// import subProcess from 'child_process';
// import winston from 'winston';
// import createLogger from '../logger';
// import { CallbackBoolean1 } from '../interfaces/callbacks';
//
// export default class DeploymentService {
//   private parser = new ConfigParser();
//
//   private nginxConf = { http: { server: { listen: 0 }, 'upstream loadbalancer': { server: [] } } };
//   private serverConf: string[] = [];
//   private host: string;
//   private logger: winston.Logger;
//
//   private secondsToWaitBeUp = 30;
//
//   private nginxConfFile = '';
//   private nginxConfTemplateFile = '';
//   private defaultMainPort = 0;
//   private defaultMain = '';
//   private dockerPorts = {
//     0: 'v1-java-1',
//     1: 'v1-java-2',
//   };
//
//   constructor(logger: winston.Logger, mHost: string, mConf: string, mConfTemplate: string, mMainPort: number, mMain: string, mDockerPorts: any) {
//     this.logger = logger;
//     this.host = mHost;
//
//     this.init(mConf, mConfTemplate, mMainPort, mMain, mDockerPorts);
//   }
//
//   public removeConfPort = (config: any, port: number) => {
//     for (const i in config) {
//       if (config[i].includes(port)) {
//         delete config[i];
//       }
//     }
//   };
//
//   public dockerCMDPrefix = () => {
//     return (
//       'PORT=' +
//       process.env.PORT +
//       ' PORT1=' +
//       process.env.PORT1 +
//       ' PORT2=' +
//       process.env.PORT2 +
//       ' MONGO_URI=' +
//       process.env.MONGO_URI
//     );
//   };
//
//   public init = (mConf: string, mConfTemplate: string, mMainPort: number, mMain: string, mDockerPorts: any) => {
//
//     this.nginxConfFile = mConf;
//     this.nginxConfTemplateFile = mConfTemplate;
//     this.defaultMainPort = mMainPort;
//     this.defaultMain = mMain;
//     this.dockerPorts = mDockerPorts;
//
//     this.parser = new ConfigParser();
//     this.logger = createLogger({
//       logLevel: 'info',
//       enableConsoleLog: true,
//       enableFileLog: false,
//     });
//
//     if (!fs.existsSync(this.nginxConfFile)) {
//       fs.copyFileSync(this.nginxConfTemplateFile, this.nginxConfFile);
//     }
//
//     this.nginxConf = this.parser.readConfigFile(
//       this.nginxConfFile,
//     );
//
//     this.serverConf = this.nginxConf['http']['upstream loadbalancer']['server'];
//
//     if (!this.serverConf) this.serverConf = [] as string[];
//     else if (typeof this.serverConf === 'string')
//       this.serverConf = [this.serverConf];
//
//     // Filter out undefined
//     this.serverConf = this.serverConf.filter(
//       (conf) => !conf.includes('undefined'),
//     );
//
//     this.nginxConf.http.server.listen = mMainPort;
//
//     this.logger.info('');
//     this.logger.info('Read Conf file...');
//     this.logger.info('Name= ' + this.nginxConfFile);
//     this.logger.info(
//       'Ports in config (Total Num)= ' +
//       this.nginxConf?.http['upstream loadbalancer']['server']?.length);
//   };
//
//   public attemptOnNginx = async () => {
//     const lineCount = Number.parseInt(
//       await this.runShellCommand(
//         `docker ps -f name=${this.defaultMain} | wc -l`,
//       ),
//     );
//
//     if (lineCount < 2) {
//       await this.deregister(Number.parseInt(process.env.PORT1 as string), true);
//       await this.deregister(Number.parseInt(process.env.PORT2 as string), true);
//
//       // Attempt start the NGINX
//       this.logger.info('Attempt to start NGINX...');
//       await this.runShellCommand(
//         `cd ../ && ${this.dockerCMDPrefix()} docker compose up ${
//           this.defaultMain
//         } -d --build`,
//       );
//     }
//
//     return true;
//   };
//
//   public writeServerConfig = async (
//     serverConfig: any,
//     skipReload = false,
//   ): Promise<void> => {
//     this.nginxConf['http']['upstream loadbalancer']['server'] =
//       serverConfig;
//     this.parser.writeConfigFile(
//       this.nginxConfFile,
//       this.nginxConf,
//       true,
//     );
//
//     // Run shell command to reload the nginx
//     if (!skipReload)
//       await this.runShellCommand(
//         'cd ../ && docker compose exec ' +
//         this.defaultMain +
//         ' nginx -s reload',
//       );
//   };
//
//   public deregister = async (port: number, skipReload = false) => {
//     // Remove port
//     this.removeConfPort(this.serverConf, port);
//
//     // Add new entry to config
//     this.serverConf.push(this.host + '=' + port + ' down');
//     await this.writeServerConfig(this.serverConf,
//       skipReload,
//     );
//   };
//
//   public register = async (port: number, skipReload = false): Promise<void> => {
//     // Remove port
//     this.removeConfPort(this.serverConf, port);
//
//     // Add new entry to config
//     this.serverConf.push(this.host + '=' + port);
//     await this.writeServerConfig(this.serverConf, skipReload);
//   };
//
//   public waitToServerUp = async (addr: string): Promise<boolean> => {
//     const secondsToTry = this.secondsToWaitBeUp;
//
//     this.logger.info('');
//     this.logger.info('Waiting for server to be up');
//     this.logger.info('Server= ' + addr);
//     this.logger.info('');
//
//     for (let i = 0; i < this.secondsToWaitBeUp; i++) {
//       await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
//
//       try {
//         this.logger.info('Server check attempt= ' + (i + 1));
//         await this.runShellCommand('curl ' + addr, (log) =>
//           log.includes('Connection refused'),
//         );
//         this.logger.info('');
//         this.logger.info('Server is up now');
//         return true;
//       } catch {
//       }
//     }
//
//     return false;
//   };
//
//   public runShellCommand = async (cmd: string, resolvable: undefined | CallbackBoolean1<string> = undefined): Promise<string> => {
//     return new Promise<string>((resolve, reject) => {
//       subProcess.exec(cmd, (err, stdout, stdFinal) => {
//         if (err) {
//           return reject(err);
//         }
//
//         this.logger.info(stdout);
//         this.logger.info(stdFinal);
//
//         if (resolvable && resolvable(stdout)) resolve(stdout);
//         else resolve(stdout);
//         // this.logger.info(`The stdout Buffer from shell= ${stdout.toString()}`)
//         // this.logger.info(`The stderr Buffer from shell= ${stderr.toString()}`)
//
//         // if (stdFinal) {
//         //     console.error(stdFinal);
//         //     return reject(stdFinal);
//         // }
//       });
//     });
//   };
//
//   public getPort = (str: string): number => {
//     for (const port of Object.keys(this.dockerPorts)) {
//       if (str?.includes(port)) return port;
//     }
//   };
//
//   public getRunningInstances = async () => {
//     const resp = (
//       await this.runShellCommand(
//         'docker ps -f name=javav1 --format {{.ID}};;{{.Image}};;{{.Ports}} | grep -w javav1',
//       )
//     )?.split('\n');
//     const result = [];
//
//     for (const element of resp) {
//       if (!element) continue;
//       const temp = element.split(';;');
//
//       if (!this.getPort(temp[2])) continue;
//       result.push({
//         id: temp[0],
//         title: temp[1],
//         port: this.getPort(temp[2]) + '',
//         service: this.dockerPorts[this.getPort(temp[2]) as number],
//       });
//     }
//
//     return result;
//   };
//
//   public getDeploymentInstance = async () => {
//     for (const conf of this.serverConf) {
//       if (!conf) continue;
//       if (conf.includes('down')) {
//         const port = Number.parseInt(conf.split(' ')[0].split('=')[1]);
//         return { [port]: this.dockerPorts[port] as string };
//       }
//     }
//
//     // else get the first port
//     return {
//       [Object.keys(this.dockerPorts)[0]]:
//         this.dockerPorts[Object.keys(this.dockerPorts)[0]],;
//     };
//   };
//
//   public getOtherInstance = (ports: number[]) => {
//     const result = {};
//     for (const port in this.dockerPorts) {
//       if (ports.includes(port)) continue;
//       result[port] = this.dockerPorts[port];
//     }
//
//     return result;
//   };
//
//   performDeployment = async (): Promise<void> => {
//     // First check the deployable instances
//     this.logger.info('Getting the free deployable instances');
//
//     const deployableInstances = await this.getDeploymentInstance();
//
//     if (!deployableInstances || Object.keys(deployableInstances).length === 0) {
//       this.logger.info('Error deploying code');
//       this.logger.info(deployableInstances);
//       this.logger.info('No deployable instance found');
//       process.exit(1);
//     }
//
//     this.logger.info('Going to deploy the code on free instances...');
//     this.logger.info(JSON.stringify(deployableInstances));
//
//     // deregister first
//     // await this.deregister(deployableInstances);
//
//     for (const instance of Object.keys(deployableInstances)) {
//       await this.runShellCommand(
//         `cd ../ && ${this.dockerCMDPrefix()} docker compose up ${
//           deployableInstances[instance]
//         } -d --build`,
//       );
//
//       // Now wait for instance  for being up
//       if (!(await this.waitToServerUp('http=//localhost=' + instance))) {
//         await this.deregisterAndDown(
//           instance,
//           deployableInstances[instance],
//         );
//         continue;
//       }
//
//       // Register the instance
//       await this.register(instance);
//       // Else deregister the main one
//     }
//
//     // Now deregister other instance
//     const otherInstances = this.getOtherInstance(
//       Object.keys(deployableInstances),
//     );
//     if (otherInstances)
//       for (const port of Object.keys(otherInstances)) {
//         await this.deregisterAndDown(port, otherInstances[port]);
//       }
//   };
//
//   deregisterAndDown = async (port, instance) => {
//     // Deregister
//     await this.deregister(port);
//
//     // Stop the instance
//     await this.runShellCommand(
//       `cd ../ && docker compose down ${instance}`,
//     );
//   };
// }
