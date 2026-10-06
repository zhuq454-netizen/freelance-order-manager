import { describe, expect, it } from 'vitest';
import { contentStatusSchema, createInquiryInputSchema, inquiryStatusSchema, publicProjectDetailSchema, publicServiceDetailSchema } from '../src/public-content.js';

describe('public content contracts', () => {
  it('normalizes valid inquiry input and requires consent', () => {
    expect(createInquiryInputSchema.parse({ contactName: ' 李明 ', contactValue: 'li@example.com', contactMethod: 'email', title: ' 企业宣传片剪辑 ', description: ' 需要一支 60 秒宣传片 ', consent: true })).toMatchObject({ contactName: '李明', title: '企业宣传片剪辑', description: '需要一支 60 秒宣传片' });
  });
  it('rejects invalid values and unknown states', () => {
    expect(() => createInquiryInputSchema.parse({ contactName: '', contactValue: 'x', contactMethod: 'email', title: 'x', description: 'x', consent: true })).toThrow();
    expect(() => createInquiryInputSchema.parse({ contactName: 'x', contactValue: 'x', contactMethod: 'email', title: 'x', description: 'x', consent: false })).toThrow();
    expect(() => inquiryStatusSchema.parse('completed')).toThrow();
    expect(contentStatusSchema.parse('published')).toBe('published');
  });
  it('does not expose private fields in public schemas', () => {
    expect(publicServiceDetailSchema.shape).not.toHaveProperty('internalNotes');
    expect(publicProjectDetailSchema.shape).not.toHaveProperty('customerContact');
  });
});
