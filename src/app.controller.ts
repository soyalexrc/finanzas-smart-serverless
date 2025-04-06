import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('')
export class AppController {
  @Get('/.well-known/apple-app-site-association')
  async getAppleAppSiteAssociation(@Res() res: Response) {
    const jsonResponse = {
      applinks: {
        details: [
          {
            appID: 'ABCDE12345.com.example.app', // Example appID
            paths: ['/', '/about', '/contact'], // Example paths
          },
        ],
      },
    };

    // Set Content-Type to application/json
    res.setHeader('Content-Type', 'application/json');

    // Send the JSON response
    return res.json(jsonResponse);
  }
}
