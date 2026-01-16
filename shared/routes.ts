import { z } from 'zod';
import { insertUserSchema, insertSettingsSchema, insertContentSchema, users, parentalSettings, content, friends, friendRequests, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:childId',
      responses: {
        200: z.custom<typeof parentalSettings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings/:childId',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof parentalSettings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  content: {
    list: {
      method: 'GET' as const,
      path: '/api/content',
      input: z.object({
        type: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof content.$inferSelect>()),
      },
    },
    shorts: {
      method: 'GET' as const,
      path: '/api/content/shorts',
      responses: {
        200: z.array(z.custom<typeof content.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/content',
      input: insertContentSchema,
      responses: {
        201: z.custom<typeof content.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  friends: {
    list: {
      method: 'GET' as const,
      path: '/api/friends/:userId',
      responses: {
        200: z.array(z.custom<typeof friends.$inferSelect>()),
      },
    },
    requests: {
      method: 'GET' as const,
      path: '/api/friends/requests/:userId',
      responses: {
        200: z.array(z.custom<typeof friendRequests.$inferSelect>()),
      },
    },
    pendingApproval: {
      method: 'GET' as const,
      path: '/api/friends/pending-approval/:parentId',
      responses: {
        200: z.array(z.custom<typeof friendRequests.$inferSelect>()),
      },
    },
    sendRequest: {
      method: 'POST' as const,
      path: '/api/friends/request',
      input: z.object({
        fromUserId: z.number(),
        toUserId: z.number(),
      }),
      responses: {
        201: z.custom<typeof friendRequests.$inferSelect>(),
      },
    },
    approveRequest: {
      method: 'POST' as const,
      path: '/api/friends/approve/:requestId',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    rejectRequest: {
      method: 'POST' as const,
      path: '/api/friends/reject/:requestId',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages/:userId/:friendId',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/messages',
      input: z.object({
        senderId: z.number(),
        receiverId: z.number(),
        content: z.string().min(1),
      }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    },
  },
  explore: {
    search: {
      method: 'GET' as const,
      path: '/api/explore/search',
      responses: {
        200: z.array(z.object({
          id: z.string(),
          title: z.string(),
          thumbnailUrl: z.string(),
          channelTitle: z.string(),
        })),
      },
    },
    categories: {
      method: 'GET' as const,
      path: '/api/explore/categories',
      responses: {
        200: z.array(z.object({
          name: z.string(),
          query: z.string(),
        })),
      },
    },
  },
  chatbot: {
    chat: {
      method: 'POST' as const,
      path: '/api/chatbot/chat',
      input: z.object({
        userId: z.number(),
        message: z.string().min(1),
      }),
      responses: {
        200: z.object({
          response: z.string(),
        }),
      },
    },
  },
  children: {
    list: {
      method: 'GET' as const,
      path: '/api/children/:parentId',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/children/add',
      input: z.object({
        parentId: z.number(),
        username: z.string().min(1),
        password: z.string().min(4),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
