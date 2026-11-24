import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChannelType = 'whatsapp' | 'instagram';
export type MessageSender = 'contact' | 'agent' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  status?: MessageStatus;
}

export interface IConversation extends Document {
  organizationId: Types.ObjectId;
  channel: ChannelType;
  contactName: string;
  contactPhone?: string;
  contactHandle?: string;
  contactAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  stage: string;
  isFavourite: boolean;
  assignedTo: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    sender: {
      type: String,
      enum: ['contact', 'agent', 'system'],
      required: true,
      default: 'agent',
    },
    content: { type: String, required: true, trim: true },
    timestamp: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'delivered',
    },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'instagram'],
      required: true,
      default: 'whatsapp',
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactHandle: {
      type: String,
      trim: true,
    },
    contactAvatar: {
      type: String,
      trim: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    stage: {
      type: String,
      default: 'New',
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ organizationId: 1, channel: 1 });
ConversationSchema.index({ organizationId: 1, isFavourite: 1 });
ConversationSchema.index({ organizationId: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
