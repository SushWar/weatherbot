import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrambotService } from 'src/telegrambot/telegrambot.service';
import { DatabaseService } from 'src/database/database.service';
import { Telegram } from 'telegraf';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

@Injectable()
export class TelegramclientService {
  private token: string;
  private telegramBot: Telegram;
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

  constructor(
    private readonly configService: ConfigService,
    private readonly telegrambotService: TelegrambotService,
    private readonly databaseService: DatabaseService,
  ) {
    this.initiateTelegramBot();
  }

  //-------------Start & Update---------------------------------------------------------------------------------------------------
  initiateTelegramBot = async () => {
    try {
      const token = await this.databaseService.getToken();
      this.telegramBot = new Telegram(token);
    } catch (error) {
      console.error('Error setting up Telegram bot:', error);
    }
  };

  updateToken() {
    try {
      if (this.telegramBot) {
        this.telegramBot = null;
      }
      this.initiateTelegramBot();
    } catch (error) {
      console.error('Error updating bot token:', error);
    }
  }

  //-------------------------------Start & Update-----------------------------------------------------------------------------------

  async getBotInfo() {
    try {
      const info = await this.telegramBot.getMe();
      return info;
    } catch (error) {
      console.log(`getBotInfo() function fails / ${error.message}`);
      return error;
    }
  }

  async getBotShortDescription() {
    try {
      const shortDes = await this.telegramBot.getMyShortDescription();
      return shortDes;
    } catch (error) {
      console.log(`getBotShortDescription() function fails / ${error.message}`);
      return error;
    }
  }

  async getBotDescription() {
    try {
      const description = await this.telegramBot.getMyDescription();
      return description;
    } catch (error) {
      console.log(`getBotShortDescription() function fails / ${error.message}`);
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
      console.log(`generateNewToken() function fails / ${error.message}`);
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
        this.updateToken();
        this.telegrambotService.updateToken();
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
      console.log(`getAccessToken() function fails / ${error.message}`);
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
      console.log(`updateBotName() function fails / ${error.message}`);
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
      const isUpdated = await this.telegramBot.setMyShortDescription(value);
      if (isUpdated) {
        return { message: 'ok' };
      } else {
        return { message: 'Please check your Connection !!' };
      }
    } catch (error: any) {
      console.log(`updateBotBio() function fails / ${error.message}`);
      return error;
    }
  }

  async updateBotDescription(body: any) {
    try {
      const { value } = body;
      const isUpdated = await this.telegramBot.setMyDescription(value);
      if (isUpdated) {
        return { message: 'ok' };
      } else {
        return { message: 'Please check your Connection !!' };
      }
    } catch (error: any) {
      console.log(`updateBotDescription() function fails / ${error.message}`);
      return error;
    }
  }

  //--------------Subscriber functions--------------------------------------------------------------------------------------------------

  async getSubscriber() {
    try {
      const userData = await this.databaseService.subscriberDetailMany();
      return { message: 'ok', data: userData };
    } catch (error) {
      console.log(`getSubscriber() function fails / ${error.message}`);
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
      console.log(`updateBotDescription() function fails / ${error.message}`);
      return error;
    }
  }

  async sendCustumMessageAllSubscriber(body: any) {
    try {
      const { message } = body;

      const userData = await this.databaseService.subscriberDetailMany();
      userData.forEach(async (user) => {
        await this.telegramBot.sendMessage(user.telegramId, message);
      });

      return { sendAll: 'ok' };
    } catch (error) {
      console.log(
        `sendCustumMessageAllSubscriber() function fails / ${error.message}`,
      );
      return error;
    }
  }

  //----------------Helper functions------------------------------------------------------------------------------------------------

  decryptMessage(obj: any) {
    const msg = obj.messages[0].message.split('\n');
    return msg[1];
  }
}
