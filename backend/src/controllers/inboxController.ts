import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Conversation } from '../models/Conversation';
import { Types } from 'mongoose';

// Helper to format conversation response with id as string
const formatConversation = (conv: any) => ({
  id: conv._id.toString(),
  channel: conv.channel,
  contactName: conv.contactName,
  contactPhone: conv.contactPhone,
  contactHandle: conv.contactHandle,
  contactAvatar: conv.contactAvatar,
  lastMessage: conv.lastMessage,
  lastMessageTime: conv.lastMessageTime,
  unreadCount: conv.unreadCount,
  stage: conv.stage,
  isFavourite: conv.isFavourite,
  assignedTo: conv.assignedTo,
  messages: conv.messages,
  createdAt: conv.createdAt,
  updatedAt: conv.updatedAt,
});

export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { channel, search, filter, stage } = req.query;

    const query: any = { organizationId };

    if (channel && channel !== 'all') {
      query.channel = channel;
    }

    if (stage && stage !== 'All') {
      query.stage = stage;
    }

    if (filter === 'Unread') {
      query.unreadCount = { $gt: 0 };
    } else if (filter === 'Favourites') {
      query.isFavourite = true;
    } else if (filter === 'Unassigned') {
      query.assignedTo = { $in: ['Unassigned', '', null] };
    } else if (filter === 'Mine') {
      const userName = req.user?.name || '';
      if (userName) {
        query.assignedTo = userName;
      }
    }

    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { contactName: regex },
        { contactPhone: regex },
        { contactHandle: regex },
        { lastMessage: regex },
      ];
    }

    const conversations: any[] = await Conversation.find(query).sort({ updatedAt: -1 });

    res.status(200).json(conversations.map(formatConversation));
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getConversationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const conversation = await Conversation.findOne({ _id: id, organizationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Mark as read
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      await conversation.save();
    }

    res.status(200).json(formatConversation(conversation));
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const createConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const {
      contactName,
      contactPhone,
      contactHandle,
      channel = 'whatsapp',
      initialMessage,
      assignedTo,
    } = req.body;

    if (!contactName) {
      res.status(400).json({ error: 'Contact name is required' });
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messages = initialMessage
      ? [
          {
            id: `msg-${Date.now()}`,
            sender: 'agent' as const,
            content: initialMessage,
            timestamp: currentTime,
            status: 'sent' as const,
          },
        ]
      : [];

    const newConv = await Conversation.create({
      organizationId: new Types.ObjectId(organizationId),
      channel,
      contactName,
      contactPhone,
      contactHandle,
      contactAvatar: '',
      lastMessage: initialMessage || 'Chat started',
      lastMessageTime: currentTime,
      unreadCount: 0,
      stage: 'New',
      isFavourite: false,
      assignedTo: assignedTo || req.user?.name || 'Unassigned',
      messages,
    });

    res.status(201).json(formatConversation(newConv));
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    const { content, sender = 'agent' } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const conversation = await Conversation.findOne({ _id: id, organizationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: sender as 'contact' | 'agent' | 'system',
      content: content.trim(),
      timestamp: currentTime,
      status: sender === 'agent' ? ('sent' as const) : ('delivered' as const),
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = content.trim();
    conversation.lastMessageTime = currentTime;
    if (sender === 'contact') {
      conversation.unreadCount += 1;
    }

    await conversation.save();

    res.status(200).json({
      message: newMessage,
      conversation: formatConversation(conversation),
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const toggleFavourite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const conversation = await Conversation.findOne({ _id: id, organizationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    conversation.isFavourite = !conversation.isFavourite;
    await conversation.save();

    res.status(200).json(formatConversation(conversation));
  } catch (error: any) {
    console.error('Error toggling favourite:', error);
    res.status(500).json({ error: 'Failed to toggle favourite' });
  }
};

export const updateStage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    const { stage } = req.body;

    if (!stage) {
      res.status(400).json({ error: 'Stage is required' });
      return;
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, organizationId },
      { stage },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.status(200).json(formatConversation(conversation));
  } catch (error: any) {
    console.error('Error updating stage:', error);
    res.status(500).json({ error: 'Failed to update stage' });
  }
};

export const deleteConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const result = await Conversation.findOneAndDelete({ _id: id, organizationId });
    if (!result) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.status(200).json({ message: 'Conversation deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

