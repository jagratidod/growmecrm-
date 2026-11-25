import { request } from './api';

export type BotChannel = 'all' | 'whatsapp' | 'instagram';
export type BotTriggerType =
  | 'FIRST_MESSAGE'
  | 'KEYWORD'
  | 'GET_QUOTE'
  | 'OFF_HOURS'
  | 'TRIP_COMPLETED'
  | 'MANUAL';

export interface BotStep {
  id: string;
  stepNumber: number;
  stepType: 'send_message' | 'ask_question' | 'button_choices' | 'assign_agent' | 'tag_lead';
  content: string;
  options?: string[];
  delaySeconds?: number;
}

export interface BotFlowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerType?: BotTriggerType;
  triggerConfig?: {
    keywords?: string[];
    offHoursStart?: string;
    offHoursEnd?: string;
    leadStatus?: string;
  };
  stepsCount: number;
  channel: BotChannel;
  enabled: boolean;
  steps?: BotStep[];
  stats?: {
    totalTriggered: number;
    totalCompleted: number;
    lastTriggeredAt?: string;
  };
  createdAt?: string;
}

export const botFlowsService = {
  // 1. Get all bot flows
  async getBotFlows(params?: {
    channel?: string;
    enabled?: boolean;
  }): Promise<{ flows: BotFlowItem[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.channel && params.channel !== 'all') query.append('channel', params.channel);
    if (params?.enabled !== undefined) query.append('enabled', String(params.enabled));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ flows: BotFlowItem[]; count: number }>(`/bot-flows${qs}`, {
      method: 'GET',
    });
  },

  // 2. Get single flow by ID
  async getBotFlowById(id: string): Promise<{ flow: BotFlowItem }> {
    return request<{ flow: BotFlowItem }>(`/bot-flows/${id}`, {
      method: 'GET',
    });
  },

  // 3. Create a new bot flow
  async createBotFlow(
    data: Omit<BotFlowItem, 'id'>
  ): Promise<{ message: string; flow: BotFlowItem }> {
    return request<{ message: string; flow: BotFlowItem }>('/bot-flows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Update an existing flow
  async updateBotFlow(
    id: string,
    updates: Partial<BotFlowItem>
  ): Promise<{ message: string; flow: BotFlowItem }> {
    return request<{ message: string; flow: BotFlowItem }>(`/bot-flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Toggle active status
  async toggleBotFlow(
    id: string
  ): Promise<{ message: string; enabled: boolean; flow: BotFlowItem }> {
    return request<{ message: string; enabled: boolean; flow: BotFlowItem }>(
      `/bot-flows/${id}/toggle`,
      {
        method: 'PATCH',
      }
    );
  },

  // 6. Delete a flow
  async deleteBotFlow(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/bot-flows/${id}`, {
      method: 'DELETE',
    });
  },

};
