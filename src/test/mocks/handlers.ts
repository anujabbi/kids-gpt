import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
      },
    });
  }),

  // Mock profiles endpoint
  http.get('*/rest/v1/profiles', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        full_name: 'Test User',
        role: 'parent',
        family_id: 'mock-family-id',
      },
    ]);
  }),

  // Mock conversations endpoint
  http.get('*/rest/v1/conversations', () => {
    return HttpResponse.json([
      {
        id: 'conv-1',
        title: 'Test Conversation',
        user_id: 'mock-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      },
    ]);
  }),

  // Mock OpenAI endpoint
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'This is a mock AI response.',
          },
        },
      ],
    });
  }),
];