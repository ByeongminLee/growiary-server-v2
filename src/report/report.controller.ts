import { Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async report() {
    const data = await this.reportService.report();
    return { message: 'Success report', data };
  }
}
