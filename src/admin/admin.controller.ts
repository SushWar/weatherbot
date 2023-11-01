import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) {}

    @Post('/provider')
    async provideLogin(@Body() vals){
        return await this.adminService.providerLogin(vals)
    }

    @Post('/portal')
    async portalLOgin(@Body() vals){
        return await this.adminService.portalLogin(vals)
    }
}
