import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { message, emoji } from './telegrambot.constants';
import axios from 'axios';

@Injectable()
export class TelegrambotService {
  private token;
  private weatherUrl = this.configService.get<string>('WEATHER_URL');
  private weatherApi = this.configService.get<string>('WEATHER_API');
  private bot: Telegraf;
  private firstName: string;
  private lastName = '';
  private userName = '';
  private city: string;
  private isSubscribed: boolean;
  private isBlocked: boolean;
  private id: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    this.setupBot();
  }

  //---------------------------------------------------------------Setup Bot--------------------------------------------------------------------------------------
  async setupBot() {
    try {
      const token = await this.databaseService.getToken();
      this.token = token;
      this.bot = new Telegraf(this.token);
      this.startCommand();
      this.helpCommand();
      this.commands();
      this.onRecieveMessage();
      this.bot.launch();
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> setupBot() function fails / ${error.message}`);
    }
  }

  //----------------------------------------update Token------------------------------------------------------------------------------------------------------

  updateToken() {
    try {
      if (this.bot) {
        this.bot.stop('Updating the Token');
        this.bot = null;
      }
      this.setupBot();
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> updateToken() function fails / ${error.message}`);
    }
  }

  //---------------------------------------Verifying subscriber-------------------------------------------------------------------------------------------

  async verifySubscriber() {
    try {
      const user = await this.databaseService.subscriberDetailsOne(this.id);
      if (user || user !== null) {
        this.firstName = user.firstName;
        this.city = user.city;
        this.isSubscribed = user.isSubscribed;
        this.isBlocked = user.isBlocked;
      }
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> verifySubscriber() function fails / ${error.message}`);
    }
  }

  //-------------------------------------Bot Functions----------------------------------------------------------------------------------------------------

  startCommand = () => {
    const greetings = this.getGreetings();
    this.bot.start(async (ctx) => {
      this.id = ctx.update.message.from.id;
      this.firstName = ctx.update.message.from.first_name;
      this.lastName = ctx.update.message.from.last_name;
      this.userName = ctx.update.message.from.username;
      await this.verifySubscriber();
      if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        ctx.reply(`${greetings} ${this.firstName} ${emoji.heartRibbon}
              \n${message.subscribedHelp}`);
      } else {
        ctx.reply(`${greetings} ${this.firstName}\n${message.notSubscribed}`);
      }
    });
  };

  helpCommand = () => {
    this.bot.help(async (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else {
        if (this.isBlocked) {
          ctx.reply(message.isBlocked);
        } else if (this.isSubscribed) {
          ctx.reply(message.subscribedHelp);
        } else {
          ctx.reply(`${message.notSubscribedHelp}\n${message.notSubscribed}`);
        }
      }
    });
  };

  commands = () => {
    //-------------------------------------------Subscribe Command--------------------------------------------------------------------------------------------

    this.bot.command('getcurrentweather', async (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        const msg = this.getWeather(this.city, this.firstName);
        ctx.reply(await msg);
      } else {
        ctx.reply(message.inValid);
      }
    });

    this.bot.command('changecity', (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        ctx.reply(message.changeCityCommand);
      } else {
        ctx.reply(message.inValid);
      }
    });

    this.bot.command('change', async (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        const text = ctx.message.text;
        const filter = text.split(' ');
        const cityName = filter[1];
        const msg = this.updateCity(cityName);
        ctx.reply(await msg);
      } else {
        ctx.reply(message.inValid);
      }
    });

    this.bot.command('differentcityweather', (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        ctx.reply(message.differentCityCommand);
      } else {
        ctx.reply(message.inValid);
      }
    });

    this.bot.command('different', async (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        const text = ctx.message.text;
        const filter = text.split(' ');
        const cityName = filter[1];
        const msg = this.getWeather(cityName, this.firstName);
        ctx.reply(await msg);
      } else {
        ctx.reply(message.inValid);
      }
    });

    //-------------------------------------------Unsubscribe Command--------------------------------------------------------------------------------------------

    this.bot.command('city', async (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        ctx.reply(message.inValid);
      } else {
        const text = ctx.message.text;
        const filter = text.split(' ');
        const cityName = filter[1];
        const msg = this.signUp(cityName);
        ctx.reply(await msg);
      }
    });

    this.bot.command('subscribe', (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        ctx.reply(message.inValid);
      } else {
        ctx.reply(message.subscribeCommand);
      }
    });
  };

  onRecieveMessage = () => {
    this.bot.on('message', (ctx) => {
      if (this.id === 0) {
        ctx.reply(message.start);
      } else if (this.isBlocked) {
        ctx.reply(message.isBlocked);
      } else if (this.isSubscribed) {
        ctx.reply(message.subscribedHelp);
      } else {
        ctx.reply(`${message.notSubscribedHelp}\n${message.notSubscribed}`);
      }
    });
  };

  //-----------------------------------------------------Create & Update details in database------------------------------------------------------------

  signUp = async (cityName: string) => {
    let msg = ``;
    const user = {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      cityName: cityName,
      isSubscribed: true,
      isBlocked: this.isBlocked,
    };

    try {
      const checkCity = await this.getWeatherUpdates(cityName);
      if (checkCity.cod === '200') {
        const createSubscriber = await this.databaseService.createNewUser(user);
        if (createSubscriber !== null) {
          this.isSubscribed = true;
          const weatherMsg = this.generateWeathermessage(
            checkCity,
            this.firstName,
          );
          msg = `${emoji.partyPopper} Thank you for Subscribing ${emoji.smilingHeartShapedEyes} ${emoji.envelope}
        \n${weatherMsg}`;
        }
      } else {
        msg = `Please provide the correct city name ${emoji.foldedHands}`;
      }
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> signUp() function fails / ${error.message}`);
      msg = message.catchIssue;
    }
    return msg;
  };

  updateCity = async (newCity: string) => {
    let msg = ``;
    const user = {
      id: this.id,
      newCity: newCity,
    };

    try {
      const checkCity = await this.getWeatherUpdates(newCity);
      if (checkCity.cod === '200') {
        const createSubscriber =
          await this.databaseService.updateUserCity(user);
        if (createSubscriber !== null) {
          this.city = newCity;
          const weatherMsg = this.generateWeathermessage(
            checkCity,
            this.firstName,
          );
          msg = `${emoji.envelope} City is updated now ${emoji.partyPopper}
        \n${weatherMsg}`;
        }
      } else {
        msg = `Please provide the correct city name ${emoji.foldedHands}`;
      }
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> updateCity() function fails / ${error.message}`);
      msg = message.catchIssue;
    }
    return msg;
  };

  //----------------------------------------------------Weather functions------------------------------------------------------------------------

  getWeather = async (city: string, firstName: string) => {
    let weatherMsg = ``;
    try {
      const checkCity = await this.getWeatherUpdates(city);
      if (checkCity.cod === '200') {
        weatherMsg = this.generateWeathermessage(checkCity, firstName);
      } else {
        weatherMsg = `Please provide the correct city name ${emoji.foldedHands}`;
      }
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> getWeather() function fails / ${error.message}`);
      weatherMsg = message.catchIssue;
    }

    return weatherMsg;
  };

  getWeatherUpdates = async (city: string) => {
    try {
      const response = await axios.get(
        `${this.weatherUrl}q=${city}&appid=${this.weatherApi}`,
      );

      if (response.status === 200) {
        const data = response.data;
        const weatherFilter = {
          main: data.weather[0].main,
          description: data.weather[0].description,
          temp: (data.main.temp - 273.15).toFixed(2),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windspeed: data.wind.speed,
          city: data.name,
          cod: '200',
        };

        return weatherFilter;
      } else {
        return {
          cod: '403',
        };
      }
    } catch (error) {
      console.log(`${new Date()} ==> TelegrambotService ==> getWeatherUpdates() function fails / ${error.message}`);
      return {
        cod: '404',
      };
    }
  };
  generateWeathermessage = (data: any, name: string) => {
    let weatherEmoji = ``;

    const main = data.main;
    const temp = data.temp;

    if (main === 'Haze') {
      weatherEmoji += `${emoji.haze}`;
    } else if (main === 'Clear') {
      weatherEmoji += `${emoji.clearSun}`;
    } else if (main === 'Smoke') {
      weatherEmoji += `${emoji.smoke}`;
    } else if (main === 'Clouds') {
      weatherEmoji += `${emoji.cloud} ${emoji.rainDrops}`;
    } else {
      weatherEmoji += `${emoji.sunCloud}`;
    }

    if (temp <= 15) {
      weatherEmoji += `${emoji.cold}`;
    } else {
      weatherEmoji += `${emoji.sun}`;
    }

    const weatherMessage = `The weather in the ${data.city} is ${data.description} ${weatherEmoji}
    \nwith the temperature of ${data.temp}${emoji.celcius}.
    \nThe humidity is ${data.humidity}%,
    \n the pressure is ${data.pressure}hPa and
    \n the wind speed is ${data.windspeed} ${emoji.wind}
    \nHave a nice day ${name} ${emoji.smileyOpenMouth}`;

    return weatherMessage;
  };

  //-----------------------------------------------Helper Functions-------------------------------------------------------------------------------------

  getGreetings = () => {
    const date = new Date();
    const hour = date.getHours();
    let greetings = '';
    if (hour >= 0 && hour < 12) {
      greetings = message.goodMorning;
    } else if (hour >= 12 && hour < 18) {
      greetings = message.goodAfternoon;
    } else {
      greetings = message.goodEvening;
    }

    return greetings;
  };
}
