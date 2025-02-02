import { Controller, Get, Req } from '@nestjs/common';

import { Request } from 'express';
import { NaverService } from './naver.service';

@Controller('/map-direction/v1')
export class NaverController {
  constructor(private readonly naverService: NaverService) {}

  @Get('/driving')
  async direction(@Req() req: Request) {
    console.log('req', req.query);

    return this.naverService.getDirection({
      start: req.query.start as string,
      goal: req.query.goal as string,
    });
  }
}
