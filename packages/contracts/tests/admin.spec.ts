import { describe, expect, it } from 'vitest';
import { adminInquiryDetailSchema, createInquiryNoteInputSchema, updateInquiryStatusInputSchema } from '../src/admin.js';

describe('admin contracts', () => {
  it('normalizes status updates and notes', () => {
    expect(updateInquiryStatusInputSchema.parse({ status: 'viewed' })).toEqual({ status: 'viewed' });
    expect(createInquiryNoteInputSchema.parse({ content: '  已联系客户  ' })).toEqual({ content: '已联系客户' });
  });
  it('includes private inquiry fields only in admin detail', () => {
    expect(adminInquiryDetailSchema.shape).toHaveProperty('contactValue');
    expect(adminInquiryDetailSchema.shape).toHaveProperty('notes');
  });
});
