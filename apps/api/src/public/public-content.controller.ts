import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../auth/public.decorator.js';
import { PublicContentService } from './public-content.service.js';

@ApiTags('public')
@Controller('public')
@Public()
export class PublicContentController {
  constructor(private readonly publicContentService: PublicContentService) {}

  @Get('content')
  @ApiOperation({
    summary: 'Get the published public profile, services and projects',
  })
  getContent() {
    return this.publicContentService.getContent();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get the published public profile' })
  getProfile() {
    return this.publicContentService.getProfile();
  }

  @Get('services')
  @ApiOperation({ summary: 'List published services' })
  listServices() {
    return this.publicContentService.listServices();
  }

  @Get('services/:slug')
  @ApiOperation({ summary: 'Get a published service by slug' })
  getService(@Param('slug') slug: string) {
    return this.publicContentService.getService(slug);
  }

  @Get('projects')
  @ApiOperation({ summary: 'List published projects' })
  listProjects() {
    return this.publicContentService.listProjects();
  }

  @Get('projects/:slug')
  @ApiOperation({ summary: 'Get a published project by slug' })
  getProject(@Param('slug') slug: string) {
    return this.publicContentService.getProject(slug);
  }

  @Post('inquiries')
  @ApiOperation({ summary: 'Submit an anonymous inquiry' })
  createInquiry(@Body() body: unknown) {
    return this.publicContentService.createInquiry(body);
  }
}
