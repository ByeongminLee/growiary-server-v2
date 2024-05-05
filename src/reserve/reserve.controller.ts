import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReserveService } from './reserve.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateReserveDTO } from './reserve.dto';

@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createReserve(@Body() createReserveDTO: CreateReserveDTO) {
    const data = await this.reserveService.create(createReserveDTO);

    return { message: 'reserve created', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAllReserve() {
    const data = await this.reserveService.findAll();

    return { message: 'all reserve', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findAllUserReserve() {
    const data = await this.reserveService.findAllUser();

    return { message: 'user reserve', data };
  }
}
