import { Document } from 'mongoose';
import { IUser } from '@/interfaces/IUser';
import moment from 'moment';
import { TokenInterface } from '@/interfaces/token.interface';

declare global {
  namespace expressRequestId {
    type Options = {
      setHeader?: boolean | undefined;
      headerName?: string | undefined;
      generator?: ((request: Request) => string) | undefined;
    };
  }

  namespace Express {
    export interface Request {
      id: string;
      currentUser: IUser & Document;
      appCode: number;
      time: moment.Moment;
      httpStatusCode: number;
      errors: string[];
      status: number;
      message: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any;
      token: TokenInterface;
    }
  }

  // namespace Models {
  //   export type UserModel = Model<IUser & Document>;
  // }
}
