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

    if (data === 'NOT_FOUND') {
      return {
        message: 'NOT_FOUND_POST',
        data: NOT_REPORT,
      };
    }

    return { message: 'Success report', data };
  }
}

const NOT_REPORT = {
  all: {
    post: {
      sum: 0,
      avg: 0,
      max: 0,
    },
    charactersCount: {
      sum: 0,
      avg: 0,
    },
  },
  post: {
    user: {
      '2024-05': 0,
      '2024-04': 0,
      '2024-03': 0,
      '2024-02': 0,
      '2024-01': 0,
      '2023-12': 0,
      '2023-11': 0,
    },
    all: {
      '2024-05': 0,
      '2024-04': 0,
      '2024-03': 0,
      '2024-02': 0,
      '2024-01': 0,
      '2023-12': 0,
      '2023-11': 0,
    },
  },
  week: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  time: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  charCount: {},
  topic: {
    하루생각: [],
    자아탐험: [],
    크리에이티브: [],
    회고: [],
    자유: [],
  },
  tags: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
  newTags: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
};
