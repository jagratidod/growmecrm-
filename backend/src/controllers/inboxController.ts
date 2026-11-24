import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Conversation } from '../models/Conversation';
import { Types } from 'mongoose';

const DEFAULT_DEMO_CHATS = [
  {
    channel: 'whatsapp',
    contactName: 'Aarav Mehta',
    contactPhone: '+91 98201 44521',
    contactAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    lastMessage: 'Hi! Could you share the Bali 5D/4N itinerary brochure?',
    lastMessageTime: '10:45 AM',
    unreadCount: 1,
    stage: 'New',
    isFavourite: true,
    assignedTo: 'Kushal Pareta',
    messages: [
      {
        id: 'msg-1',
        sender: 'contact',
        content: 'Hello, I saw your travel package on Instagram and wanted to check availability for December.',
        timestamp: '10:42 AM',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'agent',
        content: 'Hi Aarav! Wonderful to hear from you. We have prime dates open for Bali with private pool villas.',
        timestamp: '10:44 AM',
        status: 'read',
      },
      {
        id: 'msg-3',
        sender: 'contact',
        content: 'Hi! Could you share the Bali 5D/4N itinerary brochure?',
        timestamp: '10:45 AM',
        status: 'delivered',
      },
    ],
  },
  {
    channel: 'instagram',
    contactName: 'Priya Sen',
    contactHandle: '@priya.wanderlust',
    contactAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    lastMessage: 'Sounds great! What is the booking deposit?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    stage: 'Qualified',
    isFavourite: false,
    assignedTo: 'Kushal Pareta',
    messages: [
      {
        id: 'msg-201',
        sender: 'contact',
        content: 'Hey Treki Travels! Loving your recent reels from Gulmarg.',
        timestamp: 'Yesterday 4:15 PM',
        status: 'read',
      },
      {
        id: 'msg-202',
        sender: 'agent',
        content: 'Thanks Priya! We have our winter wonderland batches starting next week.',
        timestamp: 'Yesterday 4:30 PM',
        status: 'read',
      },
      {
        id: 'msg-203',
        sender: 'contact',
        content: 'Sounds great! What is the booking deposit?',
        timestamp: 'Yesterday 4:32 PM',
        status: 'read',
      },
    ],
  },
  {
    channel: 'whatsapp',
    contactName: 'Rohit Verma',
    contactPhone: '+91 91234 56789',
    contactAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
    lastMessage: 'Confirmed payment for the Himachal Group Trek.',
    lastMessageTime: 'Nov 18',
    unreadCount: 0,
    stage: 'Booked',
    isFavourite: true,
    assignedTo: 'Kushal Pareta',
    messages: [
      {
        id: 'msg-301',
        sender: 'contact',
        content: 'Hey Kushal, I completed the bank transfer for the Himachal trek for 2 pax.',
        timestamp: 'Nov 18, 02:10 PM',
        status: 'read',
      },
      {
        id: 'msg-302',
        sender: 'agent',
        content: 'Received with thanks Rohit! Sharing your booking voucher and packing checklist shortly.',
        timestamp: 'Nov 18, 02:25 PM',
        status: 'read',
      },
    ],
  },
  {
    channel: 'instagram',
    contactName: 'Sneha Kapoor',
    contactHandle: '@snehatravels',
    contactAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    lastMessage: 'Can you customize for a family of 4?',
    lastMessageTime: 'Nov 16',
    unreadCount: 2,
    stage: 'Proposal Sent',
    isFavourite: false,
    assignedTo: 'Unassigned',
    messages: [
      {
        id: 'msg-401',
        sender: 'contact',
        content: 'Hi! Can you customize the Kashmir package for a family of 4 with senior citizens?',
        timestamp: 'Nov 16, 06:12 PM',
        status: 'delivered',
      },
    ],
  },
];

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

    let conversations: any[] = await Conversation.find(query).sort({ updatedAt: -1 });

    // Auto-seed demo conversations if database has 0 conversations for this org
    if (conversations.length === 0 && (!channel || channel === 'whatsapp') && !search && (!filter || filter === 'All')) {
      const totalCount = await Conversation.countDocuments({ organizationId });
      if (totalCount === 0) {
        const seeded = await Conversation.insertMany(
          DEFAULT_DEMO_CHATS.map((chat) => ({
            ...chat,
            organizationId: new Types.ObjectId(organizationId),
          }))
        );
        conversations = seeded;
      }
    }

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
      contactAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`,
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

export const seedDemoConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    // Remove existing
    await Conversation.deleteMany({ organizationId });

    // Seed demo
    const seeded = await Conversation.insertMany(
      DEFAULT_DEMO_CHATS.map((chat) => ({
        ...chat,
        organizationId: new Types.ObjectId(organizationId),
      }))
    );

    res.status(201).json(seeded.map(formatConversation));
  } catch (error: any) {
    console.error('Error re-seeding demo conversations:', error);
    res.status(500).json({ error: 'Failed to seed demo conversations' });
  }
};
