import { db } from "./db";
import {
  users, parentalSettings, content, friends, friendRequests, messages, callHistory, chatbotConversations,
  type User, type InsertUser,
  type ParentalSettings,
  type Content, type InsertContent,
  type Friend, type FriendRequest, type Message, type InsertMessage,
  type CallHistory, type ChatbotConversation
} from "@shared/schema";
import { eq, and, or, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChildrenByParent(parentId: number): Promise<User[]>;
  getSettings(childId: number): Promise<ParentalSettings | undefined>;
  updateSettings(childId: number, settings: Partial<ParentalSettings>): Promise<ParentalSettings>;
  getContent(): Promise<Content[]>;
  getShorts(): Promise<Content[]>;
  createContent(item: InsertContent): Promise<Content>;
  getFriends(userId: number): Promise<Friend[]>;
  getFriendRequests(userId: number): Promise<FriendRequest[]>;
  getPendingApprovalRequests(parentId: number): Promise<FriendRequest[]>;
  createFriendRequest(fromUserId: number, toUserId: number): Promise<FriendRequest>;
  approveFriendRequest(requestId: number, parentId: number): Promise<void>;
  rejectFriendRequest(requestId: number): Promise<void>;
  getMessages(userId: number, friendId: number): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  createChatbotConversation(userId: number, userMessage: string, botResponse: string): Promise<ChatbotConversation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      avatar: insertUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${insertUser.username}`,
    }).returning();
    return user;
  }

  async getChildrenByParent(parentId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.parentId, parentId));
  }

  async getSettings(childId: number): Promise<ParentalSettings | undefined> {
    const [settings] = await db.select().from(parentalSettings).where(eq(parentalSettings.childId, childId));
    return settings;
  }

  async updateSettings(childId: number, updates: Partial<ParentalSettings>): Promise<ParentalSettings> {
    const existing = await this.getSettings(childId);
    if (!existing) {
      const [newSettings] = await db.insert(parentalSettings).values({
        childId,
        dailyTimeLimitMinutes: updates.dailyTimeLimitMinutes ?? 60,
        allowStories: updates.allowStories ?? true,
        allowLearning: updates.allowLearning ?? true,
        allowCreativity: updates.allowCreativity ?? true,
        allowMessaging: updates.allowMessaging ?? true,
        allowExplore: updates.allowExplore ?? true,
        allowShorts: updates.allowShorts ?? true,
        allowChatbot: updates.allowChatbot ?? true,
      }).returning();
      return newSettings;
    }
    const [updated] = await db.update(parentalSettings)
      .set(updates)
      .where(eq(parentalSettings.childId, childId))
      .returning();
    return updated;
  }

  async getContent(): Promise<Content[]> {
    return db.select().from(content).where(eq(content.isShort, false)).orderBy(desc(content.createdAt));
  }

  async getShorts(): Promise<Content[]> {
    return db.select().from(content).where(eq(content.isShort, true)).orderBy(desc(content.createdAt));
  }

  async createContent(item: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(content).values(item).returning();
    return newContent;
  }

  async getFriends(userId: number): Promise<Friend[]> {
    return db.select().from(friends).where(
      or(eq(friends.userId, userId), eq(friends.friendId, userId))
    );
  }

  async getFriendRequests(userId: number): Promise<FriendRequest[]> {
    return db.select().from(friendRequests).where(
      and(eq(friendRequests.toUserId, userId), eq(friendRequests.status, "pending"))
    );
  }

  async getPendingApprovalRequests(parentId: number): Promise<FriendRequest[]> {
    const children = await this.getChildrenByParent(parentId);
    const childIds = children.map(c => c.id);
    if (childIds.length === 0) return [];
    
    const requests: FriendRequest[] = [];
    for (const childId of childIds) {
      const childRequests = await db.select().from(friendRequests).where(
        and(
          or(eq(friendRequests.fromUserId, childId), eq(friendRequests.toUserId, childId)),
          eq(friendRequests.status, "pending")
        )
      );
      requests.push(...childRequests);
    }
    return requests;
  }

  async createFriendRequest(fromUserId: number, toUserId: number): Promise<FriendRequest> {
    const [request] = await db.insert(friendRequests).values({
      fromUserId,
      toUserId,
      status: "pending",
    }).returning();
    return request;
  }

  async approveFriendRequest(requestId: number, parentId: number): Promise<void> {
    const [request] = await db.select().from(friendRequests).where(eq(friendRequests.id, requestId));
    if (!request) return;

    await db.update(friendRequests)
      .set({ status: "approved", approvedByParentId: parentId })
      .where(eq(friendRequests.id, requestId));

    await db.insert(friends).values({
      userId: request.fromUserId,
      friendId: request.toUserId,
      approvedByParentId: parentId,
    });
  }

  async rejectFriendRequest(requestId: number): Promise<void> {
    await db.update(friendRequests)
      .set({ status: "rejected" })
      .where(eq(friendRequests.id, requestId));
  }

  async getMessages(userId: number, friendId: number): Promise<Message[]> {
    return db.select().from(messages).where(
      or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, friendId)),
        and(eq(messages.senderId, friendId), eq(messages.receiverId, userId))
      )
    ).orderBy(messages.createdAt);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async createChatbotConversation(userId: number, userMessage: string, botResponse: string): Promise<ChatbotConversation> {
    const [conversation] = await db.insert(chatbotConversations).values({
      userId,
      message: userMessage,
      response: botResponse,
    }).returning();
    return conversation;
  }
}

export const storage = new DatabaseStorage();
