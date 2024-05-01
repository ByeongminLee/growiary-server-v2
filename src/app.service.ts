import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const function_target = process.env.FUNCTION_TARGET;
    return `Hello World! ${function_target}`;
  }
}
