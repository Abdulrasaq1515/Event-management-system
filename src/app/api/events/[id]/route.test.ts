import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';
import { AppError, ErrorCode } from '@/lib/utils/error-handler';

// Mock the event service
vi.mock('@/lib/services/event.service', () => ({
  eventService: {
    verifyEventAccess: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock middleware and auth helpers
vi.mock('@/lib/utils/api-middleware', () => ({
  withErrorHandling: vi.fn((handler) => async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const { handleError } = await import('@/lib/utils/error-handler');
      const { createValidationErrorResponse, createErrorResponse } = await import('@/lib/utils/api-response');
      const errorResponse = handleError(error);
      if (errorResponse.code === 'VALIDATION_ERROR') {
        return createValidationErrorResponse(errorResponse.details as any);
      }
      return createErrorResponse(errorResponse.error, errorResponse.code, 500);
    }
  }),
  validateParams: vi.fn(() => undefined),
  validateRequestBody: vi.fn(async (req: NextRequest, schema: any) => await req.json()),
  checkRateLimit: vi.fn(() => true),
  handleOptions: vi.fn(() => new Response(null, { status: 204 })),
}));

vi.mock('@/lib/auth', () => ({
  optionalAuth: vi.fn(() => undefined),
  authenticateRequest: vi.fn(() => { throw new Error('Not authenticated'); }),
}));

describe('Event [id] API handlers', () => {
  beforeEach(() => {
    // Reset all mocks including their implementations to avoid cross-test
    // pollution (some tests override authenticateRequest).
    vi.resetAllMocks();
  });

  it('GET should return 200 and the event when access granted', async () => {
    const { eventService } = await import('@/lib/services/event.service');
    const sampleEvent = { id: 'e1', title: 'Test Event' } as any;
    (eventService.verifyEventAccess as any).mockResolvedValue(sampleEvent);

    const req = new NextRequest('http://localhost/api/events/e1');
    const res = await GET(req, { params: Promise.resolve({ id: 'e1' }) } as any);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject(sampleEvent);
  });

  it('GET should return 404 when event not found', async () => {
    const { eventService } = await import('@/lib/services/event.service');
    (eventService.verifyEventAccess as any).mockRejectedValue(new AppError(ErrorCode.NOT_FOUND, 'Event not found', 404));

    const req = new NextRequest('http://localhost/api/events/missing');
    const res = await GET(req, { params: Promise.resolve({ id: 'missing' }) } as any);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('GET should return 404 for forbidden read access (privacy)', async () => {
    const { eventService } = await import('@/lib/services/event.service');
    (eventService.verifyEventAccess as any).mockRejectedValue(new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403));

    const req = new NextRequest('http://localhost/api/events/e_private');
    const res = await GET(req, { params: Promise.resolve({ id: 'e_private' }) } as any);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('PUT should return 401 if unauthenticated', async () => {
    const req = new NextRequest('http://localhost/api/events/e1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Update' }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'e1' }) } as any);
    expect(res.status).toBe(401);
  });

  it('PUT should return 403 when verifyEventAccess denies update', async () => {
    // Authenticate returns a user
    const { authenticateRequest } = await import('@/lib/auth');
    (authenticateRequest as any).mockImplementation(() => ({ userId: 'u1', role: 'user' }));

    const { eventService } = await import('@/lib/services/event.service');
    (eventService.verifyEventAccess as any).mockRejectedValue(new AppError(ErrorCode.FORBIDDEN, 'Forbidden', 403));

    const req = new NextRequest('http://localhost/api/events/e1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Update' }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'e1' }) } as any);
    expect(res.status).toBe(403);
  });

  it('PUT should return 200 and updated event on success', async () => {
    const { authenticateRequest } = await import('@/lib/auth');
    (authenticateRequest as any).mockImplementation(() => ({ userId: 'u1', role: 'organizer' }));

    const updated = { id: 'e1', title: 'Updated Title' } as any;
    const { eventService } = await import('@/lib/services/event.service');
    (eventService.verifyEventAccess as any).mockResolvedValue({ id: 'e1', organizerId: 'u1' } as any);
    (eventService.update as any).mockResolvedValue(updated);

    const req = new NextRequest('http://localhost/api/events/e1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'e1' }) } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject(updated);
  });

  it('DELETE should return 401 if unauthenticated', async () => {
    const req = new NextRequest('http://localhost/api/events/e1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'e1' }) } as any);
    expect(res.status).toBe(401);
  });

  it('DELETE should return 403 when verifyEventAccess denies delete', async () => {
    const { authenticateRequest } = await import('@/lib/auth');
    (authenticateRequest as any).mockImplementation(() => ({ userId: 'u1', role: 'user' }));

    const { eventService } = await import('@/lib/services/event.service');
    (eventService.verifyEventAccess as any).mockRejectedValue(new AppError(ErrorCode.FORBIDDEN, 'Forbidden', 403));

    const req = new NextRequest('http://localhost/api/events/e1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'e1' }) } as any);
    expect(res.status).toBe(403);
  });

  it('DELETE should return 204 on success', async () => {
    const { authenticateRequest } = await import('@/lib/auth');
    (authenticateRequest as any).mockImplementation(() => ({ userId: 'u1', role: 'organizer' }));
    const { eventService } = await import('@/lib/services/event.service');
    (eventService.verifyEventAccess as any).mockResolvedValue({ id: 'e1', organizerId: 'u1' } as any);
    (eventService.delete as any).mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/events/e1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'e1' }) } as any);
    expect(res.status).toBe(204);
  });
});
