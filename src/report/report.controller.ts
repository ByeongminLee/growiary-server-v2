import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async report(@Body('date') date: string) {
    const data = await this.reportService.report({ date });

    return { message: 'Success report', data };
  }
}
