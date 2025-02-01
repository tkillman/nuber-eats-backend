import { Injectable } from '@nestjs/common';
import axios from 'axios';

const xNcpApigwApiKeyId = 'kdcml5umif';
const xNcpApigwApiKey = 'tv94fYV8Ce33yKHYCGvlRsiq2kixVUbqt8TqGiWI';

@Injectable()
export class NaverService {
  constructor() {}

  getNaver() {
    return 'hi';
  }

  // start : 출발지 좌표 ex) 127.1058342,37.3595316
  // goal : 도착지 좌표 ex) 127.1058342,37.3595316
  async getDirection(params: { start: string; goal: string }) {
    console.log('🚀 ~ NaverService ~ getDirection ~ params:', params);

    const baseUrl =
      'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving';

    const url = `${baseUrl}?start=${params.start}&goal=${params.goal}`;

    const response = await axios.get(url, {
      headers: {
        'x-ncp-apigw-api-key-id': xNcpApigwApiKeyId,
        'x-ncp-apigw-api-key': xNcpApigwApiKey,
      },
    });

    console.log('response', response.data);
    return response.data;
  }

  // query : 주소 ex) 서울특별시 종로구 사직로 161
  async getGeoCode(query: string) {
    const defaultResponse = {
      x: 0,
      y: 0,
    };

    try {
      console.log('🚀 ~ NaverService ~ getGeoCode ~ query:', query);

      const baseUrl =
        'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode';

      const url = `${baseUrl}?query=${query}`;

      const response = await axios.get(url, {
        headers: {
          'x-ncp-apigw-api-key-id': xNcpApigwApiKeyId,
          'x-ncp-apigw-api-key': xNcpApigwApiKey,
        },
      });

      defaultResponse.x = response.data.addresses[0].x;
      defaultResponse.y = response.data.addresses[0].y;

      return defaultResponse;
    } catch (error) {
      console.error('🚀 ~ NaverService ~ getGeoCode ~ error:', error);
      return defaultResponse;
    }
  }
}
