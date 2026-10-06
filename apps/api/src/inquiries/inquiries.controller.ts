import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InquiriesService } from './inquiries.service.js';

@ApiTags('admin-inquiries')
@Controller('admin/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @ApiOperation({ summary: 'List inquiries for the authenticated admin' })
  list() {
    return this.inquiriesService.list();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an inquiry detail for the authenticated admin',
  })
  get(@Param('id') id: string) {
    return this.inquiriesService.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inquiry status' })
  updateStatus(@Param('id') id: string, @Body() body: unknown) {
    return this.inquiriesService.updateStatus(id, body);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add an internal note to an inquiry' })
  addNote(@Param('id') id: string, @Body() body: unknown) {
    return this.inquiriesService.addNote(id, body);
  }
}
