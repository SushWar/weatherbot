import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, Employee, Token } from './database.constants';

@Injectable()
export class DatabaseService {
  private readonly mongoUri = this.configService.get<string>('MONGO_URI');

  constructor(private readonly configService: ConfigService) {}

  //-------------------------------------------connection---------------------------------------------------------

  async connectDatabase() {
    try {
      await mongoose.connect(this.mongoUri);
      const connect = mongoose.connection;

      connect.on('connected', () => {
        console.log('MongoDB connected successfuly');
      });
      connect.on('error', (err) => {
        console.log('MongoDb connection failed' + err);

        process.exit();
      });
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> connectDatabase() function fails / ${error.message}`);

      process.exit();
    }
  }

  //-----------------------------------------------Subscriber details on the base of telegram id-------------------

  async subscriberDetailsOne(telegramId: number) {
    try {
      await this.connectDatabase();
      const user = await User.findOne({ telegramId: telegramId });
      return user;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> subscriberDetailsOne() function fails / ${error.message}`);
      return error;
    }
  }

  //--------------------------------------------------Giving all the Subscriber details on the base of filter-----------------------------

  async subscriberDetailMany() {
    try {
      await this.connectDatabase();
      const user = await User.find({});
      return user;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> subscriberDetailMany() function fails / ${error.message}`);
      return error;
    }
  }

  //----------------------------------------------Subscriber Create & Update details------------------------------------------

  async createNewUser(user: any) {
    try {
      await this.connectDatabase();
      const newUser = new User({
        telegramId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.userName,
        city: user.cityName,
        isSubscribed: user.isSubscribed,
        isBlocked: user.isBlocked,
      });
      const saveUser = await newUser.save();
      return saveUser;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> createNewUser() function fails / ${error.message}`);
      return error;
    }
  }

  async updateUserCity(user: any) {
    try {
      await this.connectDatabase();
      const updateEntry = await User.findOneAndUpdate(
        { telegramId: user.id },
        {
          city: user.newCity,
        },
      );
      return updateEntry;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> updateUserCity() function fails / ${error.message}`);
      return error;
    }
  }

  async blockUnblockSubscriber(body: any) {
    try {
      const { id, value } = body;
      await this.connectDatabase();
      const updateEntry = await User.findOneAndUpdate(
        { telegramId: id },
        {
          isBlocked: value,
        },
      );
      return updateEntry;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> blockUnblockSubscriber() function fails / ${error.message}`);
      return error;
    }
  }

  //----------------------------------------------Get Token-------------------------------------------------------

  async getToken() {
    try {
      await this.connectDatabase();
      const tokenData = await Token.find({}).sort({ date: -1 }).maxTimeMS(90000).exec();
      return tokenData[0].token;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> getToken() function fails / ${error.message}`);
      return error;
    }
  }

  //-------------------------------------------Push new Token----------------------------------------------------

  async pushToken(tokenData: any) {
    try {
      const { name, token } = tokenData;
      await this.connectDatabase();
      const newToken = new Token({
        name: name,
        token: token,
        date: new Date(),
      });
      const saveToken = newToken.save();
      return saveToken;
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> getToken() pushToken fails / ${error.message}`);
      return error;
    }
  }

  //-------------------------------------------------Admin Auth------------------------------------------------------

  async loginExternal(vals: any) {
    try {
      const { name, email, signAs } = vals;
      const date = new Date();
      await this.connectDatabase();
      const duplicate = await Employee.findOne({ email });
      if (!duplicate) {
        const newEmployee = new Employee({
          name,
          email,
          date,
        });
        const entry = await newEmployee.save();
      }

      return { login: 'ok' };
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> loginExternal() pushToken fails / ${error.message}`);
      return error;
    }
  }

  async loginInternal(vals: any) {
    try {
      const { email, password } = vals;
      await this.connectDatabase();
      const data = await Employee.findOne({ email });
      if (data.password === password) {
        return { login: 'ok' };
      }
      return { login: 'failed', name: data.name, email: data.email };
    } catch (error) {
      console.log(`${new Date()} ==> DatabaseService ==> loginInternal() pushToken fails / ${error.message}`);
      return error;
    }
  }
}
