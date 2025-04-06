import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('')
export class AppController {
  @Get('/.well-known/apple-app-site-association')
  async getAppleAppSiteAssociation(@Res() res: Response) {
    const jsonResponse = {
      applinks: {
        apps: [],
        details: [
          {
            appID: '86978KA5GP.com.alexrc.finanzasok2404', // Example app identifier
            paths: ['*'], // Example paths
          },
        ],
      },
      activityContinuation: {
        apps: ['86978KA5GP.com.alexrc.finanzasok2404'], // Example app identifier
      },
      webcredentials: {
        apps: ['86978KA5GP.com.alexrc.finanzasok2404'], // Example app identifier
      },
      appclips: {},
    };

    // Set Content-Type to application/json
    res.setHeader('Content-Type', 'application/json');

    // Send the JSON response
    return res.json(jsonResponse);
  }

  @Get('/.well-known/assetlinks.json')
  async getAssetLinks(@Res() res: Response) {
    const jsonResponse = [
      {
        relation: ['delegate_permission/common.get_login_creds'],
        target: {
          namespace: 'android_app',
          package_name: 'com.alexrc.finanzas_ok', // Example package name
          sha256_cert_fingerprints: [
            'F9:E0:9D:AC:92:29:62:59:57:91:E6:6A:79:41:A1:29:CD:71:A0:12:99:9B:DD:97:13:3C:31:58:E7:EE:83:2B', // Example SHA-256 fingerprint
          ],
        },
      },
    ];

    // Set Content-Type to application/json
    res.setHeader('Content-Type', 'application/json');

    // Send the JSON response
    return res.json(jsonResponse);
  }
}
