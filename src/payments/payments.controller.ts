import { Body, Controller, Post } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor() {}

  @Post()
  async createPayment(@Body() body) {
    console.log(body);
    return 'Payment created';
  }
}
