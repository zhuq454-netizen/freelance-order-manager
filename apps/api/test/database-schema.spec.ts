import { describe, expect, it } from 'vitest';
import {
  auditEvents,
  inquiries,
  projectServices,
  projects,
  services,
} from '../src/database/schema.js';

describe('phase 1 database schema', () => {
  it('defines unique slugs and project service columns', () => {
    expect(services.slug.isUnique).toBe(true);
    expect(projects.slug.isUnique).toBe(true);
    expect(projectServices).toHaveProperty('projectId');
    expect(projectServices).toHaveProperty('serviceId');
  });
  it('defines inquiry default and required consent timestamp', () => {
    expect(inquiries.status.hasDefault).toBe(true);
    expect(inquiries.status.default).toBe('new');
    expect(inquiries.consentAt.notNull).toBe(true);
  });
  it('defines audit actor, action, and timestamp', () => {
    expect(auditEvents.actorId.notNull).toBe(true);
    expect(auditEvents.action.notNull).toBe(true);
    expect(auditEvents.createdAt.notNull).toBe(true);
  });
});
