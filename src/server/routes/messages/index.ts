import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq, desc, or, and, isNull } from "drizzle-orm";
import { conversations, messages } from "../../db/schema";
import { checkUserExists } from "../../utils/userExists";

const router = express.Router();

// GET    /chat/:myId/:theirId               # List messages between two parties
router.get(
  "/chat/:myId/:theirId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;
      const myId = Number(req.params.myId);
      const theirId = Number(req.params.theirId);

      const conversation = await db.query.messages.findMany({
        limit,
        offset,
        orderBy: desc(messages.createdAt),
        where: or(
          and(eq(messages.senderId, myId), eq(messages.receiverId, theirId)),
          and(eq(messages.senderId, theirId), eq(messages.receiverId, myId))
        ),
      });
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  }
);
// POST   /                # Send message
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (
      !(
        (await checkUserExists(senderId)) && (await checkUserExists(receiverId))
      )
    ) {
      res
        .status(400)
        .json({ error: "Failed to send message: User(s) don't exist." });
      return;
    }

    const [participantOne, participantTwo] = [senderId, receiverId].sort(
      (a, b) => a - b
    );

    let conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.participantOne, participantOne),
        eq(conversations.participantTwo, participantTwo)
      ),
    });

    if (conversation) {
      // Verify participants
      const isValidParticipant =
        (senderId === conversation.participantOne &&
          receiverId === conversation.participantTwo) ||
        (senderId === conversation.participantTwo &&
          receiverId === conversation.participantOne);

      if (!isValidParticipant) {
        throw new Error("Invalid message participants for this conversation");
      }

      if (!conversation.isActive) {
        throw new Error("Cannot send message to inactive conversation");
      }
    }

    if (!conversation) {
      const result = await db
        .insert(conversations)
        .values({
          participantOne: participantOne,
          participantTwo: participantTwo,
          lastMessage: content,
          lastMessageAt: new Date(),
        })
        .returning();

      conversation = result[0];
    } else {
      await db
        .update(conversations)
        .set({
          lastMessage: content,
          lastMessageAt: new Date(),
        })
        .where(eq(conversations.id, conversation.id));
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId,
        receiverId,
        conversationId: conversation.id,
        content,
      })
      .returning();

    res.status(200).json(newMessage);
  } catch (error) {
    next(error);
  }
});

// GET    /:id            # Get message details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messageId = Number(req.params.id);

    const messageDetails = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    res.status(200).json(messageDetails);
  } catch (error) {
    next(error);
  }
});

// PUT    /:id/read       # Mark message as read
router.put(
  "/:id/read",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messageId = Number(req.params.id);

      const readMessage = await db
        .update(messages)
        .set({ readAt: new Date() })
        .where(eq(messages.id, messageId))
        .returning();
      res.status(204).json(readMessage);
    } catch (error) {
      next(error);
    }
  }
);
//GET      /:userId/unread  # Get unread message count for a user
router.get(
  "/:userId/unread",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.userId);

      const unreadMessages = await db.query.messages.findMany({
        where: and(eq(messages.receiverId, userId), isNull(messages.readAt)),
      });

      res.json({ count: unreadMessages.length });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's recent conversations (list of users they've chatted with)
router.get(
  "/:userId/chats",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.userId);

      const usersConversations = await db.query.conversations.findMany({
        where: or(
          eq(conversations.participantOne, userId),
          eq(conversations.participantTwo, userId)
        ),
      });

      res.json({ usersConversations });
    } catch (error) {
      next(error);
    }
  }
);
