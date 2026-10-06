import type { HealthResponse } from '@orderlydesk/contracts';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get('live')
  @ApiOperation({ summary: 'Check whether the API process is alive' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['status', 'service', 'timestamp'],
      properties: {
        status: { type: 'string', enum: ['ok'] },
        service: { type: 'string', enum: ['api'] },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  live(): HealthResponse {
    return this.response();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Check whether the API is ready to receive requests',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['status', 'service', 'timestamp'],
      properties: {
        status: { type: 'string', enum: ['ok'] },
        service: { type: 'string', enum: ['api'] },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  ready(): HealthResponse {
    return this.response();
  }

  private response(): HealthResponse {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }
}
