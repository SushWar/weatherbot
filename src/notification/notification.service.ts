import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { DatabaseService } from 'src/database/database.service';
import { emoji, message } from 'src/telegrambot/telegrambot.constants';
import { TelegrambotService } from 'src/telegrambot/telegrambot.service';
import { Telegram } from 'telegraf';

@Injectable()
export class NotificationService {
  private telegramBot: Telegram;
  private weatherUrl = this.configService.get<string>('WEATHER_URL');
  private weatherApi = this.configService.get<string>('WEATHER_API');
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    this.makeBotReady();
  }

  //---------------------------------------------Give token to the Telegram class-------------------------------------
  makeBotReady = async () => {
    try {
      const token = await this.databaseService.getToken();
      this.telegramBot = new Telegram(token);
    } catch (error) {
      console.log(`${new Date()} ==> NotificationService ==> makeBotReady() function fails / ${error.message}`);
    }
  };

  //----------------------------------------update Token------------------------------------------------------------------------------------------------------

  updateToken() {
    try {
      if (this.telegramBot) {
        this.telegramBot = null;
      }
      this.makeBotReady();
    } catch (error) {
      console.log(`${new Date()} ==> NotificationService ==> updateToken() function fails / ${error.message}`);
    }
  }

  //----------------------------------Send message to user-----------------------------------------------------------------------------------------

  async sendNotification(userId:string, message:string){
        
    await this.telegramBot.sendMessage(userId,message)
  }

  //------------------------------------------------------Weather Updates------------------------------------------------------------------------------

  getWeather = async (city: string, firstName:string) => {
    let weatherMsg = ``;
    try {
      const checkCity = await this.getWeatherUpdates(city);
      if (checkCity.cod === '200') {
        weatherMsg = this.generateWeathermessage(checkCity, firstName);
      } else {
        weatherMsg = `Please provide the correct city name ${emoji.foldedHands}`;
      }
    } catch (error) {
      console.log(`${new Date()} ==> NotificationService ==> getWeather() function fails / ${error.message}`);
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
      console.log(`${new Date()} ==> NotificationService ==> getWeatherUpdates() function fails / ${error.message}`);
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

  //------------------------------------------------Task scheduler to send Notifications to it's Subscriber daily at 9:00 AM------------------------------------------------

  @Cron('0 0 9 * * 1-7')
  async taskScheduler() {
    
    try {
      const userId = await this.databaseService.subscriberDetailMany();
      userId.forEach(async(user)=>{
        const sendMsg = await this.getWeather(user.city, user.firstName)
        await this.sendNotification(user.telegramId, sendMsg)
      });
    } catch (error) {
      console.log(`${new Date()} ==> NotificationService ==> taskScheduler() function fails / ${error.message}`);
    }

      
  }
}
