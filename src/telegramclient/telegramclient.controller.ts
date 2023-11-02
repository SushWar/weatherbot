import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { TelegramclientService } from './telegramclient.service';

@Controller('telegramclient')
export class TelegramclientController {

    constructor(private readonly telegramclientService:TelegramclientService){}

    @Get('/info')
  async getBotInfo() {
    const basic = await this.telegramclientService.getBotInfo()
    const {info, short, long} = basic
    const botInfo = {
      info: info,
      short: short,
      long: long
    };
    return botInfo;
  }


  //---------Control Actions to perform on Token-------------------------------------------------------------------------------------------------------
  @Post('/gettoken')
  async getAccessToken() {

    return await this.telegramclientService.getAccessToken();

  }

  @Post('/generatetoken')
  async generateToken(@Body() vals) {
    return await this.telegramclientService.generateNewToken(vals)
  }


  //--------------Control Subscriber functions--------------------------------------------------------------------------------------------------
  @Get('/subscriber')
  async getSubscriber() {
    return await this.telegramclientService.getSubscriber();
  }

  @Put('/blocksubscriber')
  async blockSubcriber(@Body() vals) {
    return await this.telegramclientService.block_UnblockSubscriber(vals);
  }

  @Post('/sendcustommessage')
  async sendCustomMessage(@Body() vals){
    return await this.telegramclientService.sendCustumMessageAllSubscriber(vals)
  }

  //---------Update Bot values-------------------------------------------------------------------------------------------------------

  @Put('/update/name')
  async updateBotName(@Body() des) {
    return await this.telegramclientService.updateBotName(des);
  }
  @Put('/update/bio')
  async updateBotBio(@Body() des) {
    return await this.telegramclientService.updateBotBio(des);
  }
  @Put('/update/description')
  async updateBotDescription(@Body() des) {
    return await this.telegramclientService.updateBotDescription(des);
  }

}
