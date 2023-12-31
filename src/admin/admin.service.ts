import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {

    constructor(private readonly databaseService: DatabaseService,){

    }

    //Here we can extend the logic of Authorized Role ID
    async providerLogin(vals:any){

        try {
           const res = await this.databaseService.loginExternal(vals)
           return res
        } catch (error:any) {
            console.log(`${new Date()} ==> AdminService ==> providerLogin() pushToken fails / ${error.message}`);
            return error
        }
    }


    //Here we can also use encryption on Password and compare it

    async portalLogin(vals:any){
        try {
            const res = await this.databaseService.loginInternal(vals)
            return res
            
        } catch (error) {
            console.log(`${new Date()} ==> AdminService ==> portalLogin() pushToken fails / ${error.message}`);
            return error
        }
    }
}
