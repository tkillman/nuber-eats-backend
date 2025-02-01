import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';
import { NaverService } from './naver.service';

const xNcpApigwApiKeyId = 'kdcml5umif';
const xNcpApigwApiKey = 'tv94fYV8Ce33yKHYCGvlRsiq2kixVUbqt8TqGiWI';

@Controller('')
export class NaverController {
  constructor(private readonly naverService: NaverService) {}

  @Get('/map-direction/v1/driving')
  async direction(@Req() req: Request) {
    console.log('req', req.query);

    return this.naverService.getDirection({
      start: req.query.start as string,
      goal: req.query.goal as string,
    });
  }
}
