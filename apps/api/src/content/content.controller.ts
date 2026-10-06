import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ContentService } from './content.service.js';

@ApiTags('admin-content')
@Controller('admin/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated admin content draft' })
  getDraft() {
    return this.contentService.getDraft();
  }

  @Patch()
  @ApiOperation({ summary: 'Save the authenticated admin content draft' })
  updateDraft(@Body() body: unknown) {
    return this.contentService.updateDraft(body);
  }

  @Post('publish')
  @ApiOperation({ summary: 'Validate and publish public content' })
  publish() {
    return this.contentService.publish();
  }
}
