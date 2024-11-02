import Agenda, {DefineOptions, Job} from 'agenda';
import moment from 'moment';
import {Condition, Mongoose, ObjectId} from 'mongoose';
import {Logger} from 'winston';
import JobOptionInterface from '../interfaces/job-option.interface';
import LogBuilder from '../utils/log-builder';

export default abstract class JobService<T> {
    protected _title: string | undefined;

    get title(): string {
        return this._title as string;
    }

    register = ({
                    agenda,
                    options,
                }: {
        agenda: Agenda;
        options?: DefineOptions;
    }): void => {
        if (!this.title)
            throw new Error('Invalid / Blank title found for Job Service');

        if (!agenda) throw new Error('agenda found null');

        if (options) agenda.define(this.title, options, this.onHandle);
        else agenda.define(this.title, this.onHandle);

        this.getLogger()?.info('Job registered: ' + this.title);
    };

    onHandle = async (job: Job): Promise<void> => {
        const opts = job.attrs?.data as JobOptionInterface;
        opts.logBuilder = new LogBuilder('Job Executed: ' + this.title);

        // check if job is active
        if (opts?.startDate && moment() < moment(opts?.startDate)) {
            this.getLogger()?.info(
                opts.logBuilder
                    .addSection('Job is not started yet')
                    .addSection('startDate', opts?.startDate.toDateString())
                    .build()
            );
            return;
        }

        try {
            await this.onRun(job, opts?.data as unknown as T, opts);
        } catch (error: unknown) {
            this.getLogger().error(
                opts.logBuilder.addSection('Error', error?.toString()).build()
            );
            this.getLogger()?.error(error);
            return;
        }

        /**
         * We will check here if this job has to be stopped
         */
        if (opts?.endDate && moment(opts?.endDate) < moment()) {
            await this.getMongoose()
                .connection.db?.collection(process.env.AGENDA_DB_COLLECTION as string)
                .updateOne(
                    {_id: job.attrs._id as unknown as Condition<ObjectId>},
                    {}
                );
        }

        this.getLogger().info(opts.logBuilder.build());
    };

    public async remove(): Promise<void> {
        const jobs: Job[] = await this.getAgenda().jobs({name: this.title});

        if (jobs && jobs.length > 0) {
            this.getLogger().info('job already scheduled');

            this.getLogger().info('removing job...');
            await this.getMongoose()
                .connection.db?.collection('agendaJobs')
                .deleteMany({name: this.title});
        }
    }

    public async scheduleIfNot(
        inputs: T,
        opts: JobOptionInterface = undefined as unknown as JobOptionInterface
    ): Promise<void> {
        const jobs = await this.getAgenda().jobs({name: this.title});

        if (jobs && jobs.length > 0) {
            this.getLogger().info('job already scheduled');

            if (!opts?.deleteIfExists) {
                return;
            }

            this.getLogger().info('removing job...');
            await this.getMongoose()
                .connection.db?.collection('agendaJobs')
                .deleteMany({name: this.title});
        }

        await this.schedule(inputs, opts);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public async schedule(inputs: T, opts: JobOptionInterface): Promise<void> {
        if (!this.title) throw new Error('No title defined, to schedule the job.');

        opts.data = inputs;

        const job: Job = this.getAgenda().create(this.title, opts);

        if (opts.timeStartAt) job.schedule(opts.timeStartAt);

        if (opts.timeRepeatAt) job.repeatAt(opts.timeRepeatAt);

        if (opts.timeRepeatEvery) job.repeatEvery(opts.timeRepeatEvery);

        // Update Execution time
        // job = job.computeNextRunAt();
        // job.attrs.data.executionDate = job.attrs.nextRunAt;

        await job.save();

        this.getLogger().info('Jobs is scheduled: ' + this.title);
    }

    protected abstract getLogger(): Logger;

    protected abstract getMongoose(): Mongoose;

    protected abstract getAgenda(): Agenda;

    protected abstract onRun(
        job: Job,
        data: T,
        opts: JobOptionInterface
    ): Promise<void>;

    // protected abstract onFail(
    //   job: Job,
    //   data: T,
    //   opts: JobOptionInterface
    // ): Promise<void>;
}
