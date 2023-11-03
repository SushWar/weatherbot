import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrambotService } from 'src/telegrambot/telegrambot.service';
import { DatabaseService } from 'src/database/database.service';
import { Telegram } from 'telegraf';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TelegramclientService {

  private apiId = parseInt(this.configService.get<string>('CLIENT_API_ID'), 10);
  private apiHash = this.configService.get<string>('CLIENT_API_HASH');
  private stringSession = new StringSession(
    this.configService.get<string>('TELEGRAM_SESSION_ID'),
  );
  private client = new TelegramClient(
    this.stringSession,
    this.apiId,
    this.apiHash,
    {},
  );
  private token: string
  constructor(
    private readonly configService: ConfigService,
    private readonly telegrambotService: TelegrambotService,
    private readonly databaseService: DatabaseService,
  ) {
    this.updateToken()
  }

  //-------------Start & Update---------------------------------------------------------------------------------------------------
  updateToken = async () => {
    try {
      const getToken = await this.databaseService.getToken();
      if(getToken){
        this.token = getToken
      }
    } catch (error) {
      console.error(`${new Date()} ==> TelegramclientService ==> Error setting up updateToken:`, error);
    }
  }


  //-------------------------------Start & Update-----------------------------------------------------------------------------------

  async getBotInfo() {
    try {
      const telegramBot = new Telegram(this.token);
      const biodata = {
        info: await telegramBot.getMe(),
        short: await telegramBot.getMyShortDescription(),
        long: await telegramBot.getMyDescription()
      }
      return biodata

    } catch (error) {
      console.log(`${new Date()} ==> TelegramclientService ==> getBotInfo() function fails / ${error.message}`);
      return error;
    }
  }

  //---------Actions to perform on Token-------------------------------------------------------------------------------------------------------

  async generateNewToken(body: any) {
    const { name } = body;
    try {
      return {
        message: 'Generated token',
        token: await this.stepToGenerateTokenFollow(name),
      };
    } catch (error) {
      console.log(`${new Date()} ==> TelegramclientService ==> generateNewToken() function fails / ${error.message}`);
      return error;
    }
  }

  async stepToGenerateTokenFollow(name: string) {
    await this.client.connect();
    await this.client.invoke(
      new Api.messages.SendMessage({
        peer: 'BotFather',
        message: '/revoke',
        noWebpage: true,
        noforwards: true,
      }),
    );
    setTimeout(async () => {
      await this.client.invoke(
        new Api.messages.SendMessage({
          peer: 'BotFather',
          message: '@Weathertripbot',
          noWebpage: true,
          noforwards: true,
        }),
      );
      console.log('Bot stop');
    }, 500);

    let response;
    setTimeout(async () => {
      let fullchat = await this.client.invoke(
        new Api.messages.GetHistory({
          peer: 'BotFather',
          limit: 4,
        }),
      );
      setTimeout(async () => {
        const token = await this.decryptMessage(fullchat);
        const sendDetails = {
          name: name,
          token: token,
        };
        response = await this.databaseService.pushToken(sendDetails); //push new token to database
        await this.updateToken();
        await this.telegrambotService.updateToken();
        console.log(`Generated new token`);
      }, 1);
    }, 2010);

    return new Promise((res, rej) => {
      setTimeout(() => {
        res(response);
      }, 3000);
    });
  }

  async getAccessToken() {
    try {
      return {
        message: 'Access token',
        token: await this.databaseService.getToken(),
      };
    } catch (error) {
      console.log(`${new Date()} ==> TelegramclientService ==> getAccessToken() function fails / ${error.message}`);
      return error;
    }
  }

  //---------Updating Name via steps-------------------------------------------------------------------------------------------------------

  async updateBotName(body: any) {
    try {
      const { value } = body;

      return {
        message: 'ok',
        status: await this.stepToUpdateNameFollow(value),
      };
    } catch (error: any) {
      console.log(`${new Date()} ==> TelegramclientService ==> updateBotName() function fails / ${error.message}`);
      return error;
    }
  }

  async stepToUpdateNameFollow(value: string) {
    await this.client.connect(); // This assumes you have already authenticated with .start()
    await this.client.invoke(
      new Api.messages.SendMessage({
        peer: 'BotFather',
        message: '/setname',
        noWebpage: true,
        noforwards: true,
      }),
    );
    setTimeout(async () => {
      await this.client.invoke(
        new Api.messages.SendMessage({
          peer: 'BotFather',
          message: '@Weathertripbot',
          noWebpage: true,
          noforwards: true,
        }),
      );
    }, 500);

    setTimeout(async () => {
      await this.client.invoke(
        new Api.messages.SendMessage({
          peer: 'BotFather',
          message: value,
          noWebpage: true,
          noforwards: true,
        }),
      );
    }, 1000);
    return new Promise((res, rej) => {
      setTimeout(() => {
        res('updated');
      }, 3000);
    });
  }

  //----------Updating short & long Descriptions------------------------------------------------------------------------------------------------------

  async updateBotBio(body: any) {
    try {
      const { value } = body;
      const telegramBot = new Telegram(this.token);
      const isUpdated = await telegramBot.setMyShortDescription(value);
      if (isUpdated) {
        return { message: 'ok' };
      } else {
        return { message: 'Please check your Connection !!' };
      }
    } catch (error: any) {
      console.log(`${new Date()} ==> TelegramclientService ==> updateBotBio() function fails / ${error.message}`);
      return error;
    }
  }

  async updateBotDescription(body: any) {
    try {
      const { value } = body;
      const telegramBot = new Telegram(this.token);
      const isUpdated = await telegramBot.setMyDescription(value);
      if (isUpdated) {
        return { message: 'ok' };
      } else {
        return { message: 'Please check your Connection !!' };
      }
    } catch (error: any) {
      console.log(`${new Date()} ==> TelegramclientService ==> updateBotDescription() function fails / ${error.message}`);
      return error;
    }
  }

  //--------------Subscriber functions--------------------------------------------------------------------------------------------------

  async getSubscriber() {
    try {
      const userData = await this.databaseService.subscriberDetailMany();
      return { message: 'ok', data: userData };
    } catch (error) {
      console.log(`${new Date()} ==> TelegramclientService ==> getSubscriber() function fails / ${error.message}`);
      return error;
    }
  }

  async block_UnblockSubscriber(body: any) {
    try {
      const takeAction =
        await this.databaseService.blockUnblockSubscriber(body);
      if (takeAction !== null) {
        this.telegrambotService.updateToken();
        return { status: 'ok', message: 'Successfully Updated' };
      }
    } catch (error) {
      console.log(`${new Date()} ==> TelegramclientService ==> updateBotDescription() function fails / ${error.message}`);
      return error;
    }
  }

  async sendCustumMessageAllSubscriber(body: any) {
    try {
      const { message } = body;
      const telegramBot = new Telegram(this.token);
      const userData = await this.databaseService.subscriberDetailMany();
      userData.forEach(async (user) => {
        await telegramBot.sendMessage(user.telegramId, message);
      });

      return { sendAll: 'ok' };
    } catch (error) {
      console.log(
        `${new Date()} ==> TelegramclientService ==> sendCustumMessageAllSubscriber() function fails / ${error.message}`,
      );
      return error;
    }
  }

  //----------------Helper functions------------------------------------------------------------------------------------------------

  decryptMessage(obj: any) {
    const msg = obj.messages[0].message.split('\n');
    return msg[1];
  }


  //--------------------------------------------Function to send daily notifications at 9:00am-------------------------------------------------------



  @Cron('0 0 9 * * 1-7')
  async notificationTaskScheduler() {
    const telegramBot = new Telegram(this.token);
    try {
      const userId = await this.databaseService.subscriberDetailMany();
      userId.forEach(async(user)=>{
        const message = await this.telegrambotService.getWeather(user.city, user.firstName)
        await telegramBot.sendMessage(user.telegramId,message)
      });
    } catch (error) {
      console.log(`${new Date()} ==> NotificationService ==> taskScheduler() function fails / ${error.message}`);
    }

      
  }

  //-----------------------------------Function to keep app from going inactive---------------------------------------------------------------

  @Cron('55 * * * * *')
  async idleTaskScheduler() {
    this.updateToken()
    console.log(`${new Date()} ==> TelegramclientService ==>Task scheduling job to keep out of inactivity`)
  }
}
