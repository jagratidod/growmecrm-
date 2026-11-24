import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { BotFlow, IBotFlow, IBotStep } from '../models/BotFlow';

// Helper to seed standard default flows for newly onboarded travel agencies
const DEFAULT_FLOWS_SEED = [
  {
    name: 'Instant Inquiry Greeting & Package Selector',
    description:
      'When a new traveller messages on WhatsApp or Instagram, send immediate welcome message and offer package buttons.',
    trigger: 'First message from new phone number or DM',
    triggerType: 'FIRST_MESSAGE',
    channel: 'all',
    stepsCount: 4,
    enabled: true,
    steps: [
      {
        id: 's-1',
        stepNumber: 1,
        stepType: 'send_message',
        content: 'Hi there! 👋 Welcome to our travel desk. How can we make your holiday unforgettable?',
        options: [],
        delaySeconds: 1,
      },
      {
        id: 's-2',
        stepNumber: 2,
        stepType: 'button_choices',
        content: 'Which dream destination are you planning to explore next?',
        options: ['Kashmir', 'Bali', 'Goa', 'Himachal', 'Dubai', 'Thailand'],
        delaySeconds: 0,
      },
      {
        id: 's-3',
        stepNumber: 3,
        stepType: 'ask_question',
        content: 'Awesome choice! How many travellers and which month are you planning for?',
        options: [],
        delaySeconds: 0,
      },
      {
        id: 's-4',
        stepNumber: 4,
        stepType: 'assign_agent',
        content: 'Assigning to our destination specialist to curate your custom itinerary.',
        options: [],
        delaySeconds: 0,
      },
    ],
  },
  {
    name: 'Traveller Budget & Group Size Qualifier',
    description:
      'Ask number of passengers, travel month, and estimated budget per person before assigning to agent.',
    trigger: 'Traveller clicks "Get Quote" button',
    triggerType: 'GET_QUOTE',
    channel: 'whatsapp',
    stepsCount: 3,
    enabled: true,
    steps: [
      {
        id: 's-1',
        stepNumber: 1,
        stepType: 'ask_question',
        content: 'How many adults and children will be travelling?',
        options: [],
        delaySeconds: 1,
      },
      {
        id: 's-2',
        stepNumber: 2,
        stepType: 'button_choices',
        content: 'What is your preferred hotel stay category?',
        options: ['3-Star Deluxe', '4-Star Premium', '5-Star Luxury Resort'],
        delaySeconds: 0,
      },
      {
        id: 's-3',
        stepNumber: 3,
        stepType: 'ask_question',
        content: 'What is your approximate budget per person (excluding flight tickets)?',
        options: [],
        delaySeconds: 0,
      },
    ],
  },
  {
    name: 'After Hours & Late Night Auto-Reply',
    description:
      'Sends friendly out-of-office message outside 9:00 AM - 8:00 PM and promises 9:00 AM follow-up.',
    trigger: 'Message received during off-work hours',
    triggerType: 'OFF_HOURS',
    channel: 'all',
    stepsCount: 2,
    enabled: false,
    steps: [
      {
        id: 's-1',
        stepNumber: 1,
        stepType: 'send_message',
        content: 'Hello! Our reservation team has stepped away for the evening (office hours: 9:00 AM - 8:00 PM).',
        options: [],
        delaySeconds: 1,
      },
      {
        id: 's-2',
        stepNumber: 2,
        stepType: 'send_message',
        content: 'We have received your request and our travel curator will call or WhatsApp you at 9:00 AM tomorrow!',
        options: [],
        delaySeconds: 0,
      },
    ],
  },
  {
    name: 'Post-Trip Google Review Request',
    description:
      'Automatically messages the traveller 1 day after trip return date asking for 5-star review.',
    trigger: 'Booking status changes to "Trip Completed"',
    triggerType: 'TRIP_COMPLETED',
    channel: 'whatsapp',
    stepsCount: 3,
    enabled: true,
    steps: [
      {
        id: 's-1',
        stepNumber: 1,
        stepType: 'send_message',
        content: 'Welcome back home! 🏡 We hope you had an unforgettable, seamless holiday.',
        options: [],
        delaySeconds: 1,
      },
      {
        id: 's-2',
        stepNumber: 2,
        stepType: 'ask_question',
        content: 'On a scale of 1 to 5, how would you rate your holiday experience with us?',
        options: [],
        delaySeconds: 0,
      },
      {
        id: 's-3',
        stepNumber: 3,
        stepType: 'send_message',
        content: 'Thank you! If you have a minute, please share your love on our Google page: https://g.page/r/review',
        options: [],
        delaySeconds: 0,
      },
    ],
  },
];

const formatFlow = (flow: IBotFlow) => ({
  id: flow._id.toString(),
  name: flow.name,
  description: flow.description,
  channel: flow.channel,
  trigger: flow.trigger,
  triggerType: flow.triggerType,
  triggerConfig: flow.triggerConfig,
  enabled: flow.enabled,
  stepsCount: flow.stepsCount || flow.steps?.length || 1,
  steps: flow.steps || [],
  stats: flow.stats || { totalTriggered: 0, totalCompleted: 0 },
  createdAt: flow.createdAt,
  updatedAt: flow.updatedAt,
});

// 1. GET ALL BOT FLOWS FOR LOGGED IN TENANT (with auto-seeder)
export const getBotFlows = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { channel, enabled } = req.query;
    const filter: any = { organizationId: orgId };

    if (channel && channel !== 'all') {
      filter.$or = [{ channel: channel }, { channel: 'all' }];
    }
    if (enabled !== undefined) {
      filter.enabled = enabled === 'true';
    }

    let flows = await BotFlow.find(filter).sort({ createdAt: 1 });

    // Auto-seed starter flows if this agency has no flows yet
    if (flows.length === 0 && !channel && enabled === undefined) {
      const createdSeed = await BotFlow.insertMany(
        DEFAULT_FLOWS_SEED.map((seed) => ({
          ...seed,
          organizationId: orgId,
        }))
      );
      flows = createdSeed as any;
    }

    res.status(200).json({
      flows: flows.map(formatFlow),
      count: flows.length,
    });
  } catch (error: any) {
    console.error('[BotFlowController] getBotFlows error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bot flows' });
  }
};

// 2. GET SINGLE BOT FLOW BY ID
export const getBotFlowById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const flow = await BotFlow.findOne({ _id: id, organizationId: orgId });
    if (!flow) {
      res.status(404).json({ error: 'Bot flow not found' });
      return;
    }

    res.status(200).json({ flow: formatFlow(flow) });
  } catch (error: any) {
    console.error('[BotFlowController] getBotFlowById error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bot flow' });
  }
};

// 3. CREATE NEW BOT FLOW
export const createBotFlow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const {
      name,
      description,
      channel,
      trigger,
      triggerType,
      triggerConfig,
      steps,
      enabled,
    } = req.body;

    if (!name || !trigger) {
      res.status(400).json({ error: 'Flow name and trigger are required' });
      return;
    }

    const flowSteps: IBotStep[] = Array.isArray(steps) && steps.length > 0
      ? steps.map((s: any, idx: number) => ({
          id: s.id || `s-${idx + 1}`,
          stepNumber: s.stepNumber || idx + 1,
          stepType: s.stepType || 'send_message',
          content: s.content || '',
          options: s.options || [],
          delaySeconds: s.delaySeconds || 0,
        }))
      : [
          {
            id: 's-1',
            stepNumber: 1,
            stepType: 'send_message',
            content: `Hello! Thanks for reaching out regarding ${name}.`,
            options: [],
            delaySeconds: 1,
          },
        ];

    const newFlow = new BotFlow({
      organizationId: orgId,
      name,
      description: description || '',
      channel: channel || 'all',
      trigger,
      triggerType: triggerType || 'FIRST_MESSAGE',
      triggerConfig: triggerConfig || {},
      enabled: enabled !== undefined ? enabled : true,
      stepsCount: flowSteps.length,
      steps: flowSteps,
      stats: {
        totalTriggered: 0,
        totalCompleted: 0,
      },
    });

    await newFlow.save();

    res.status(201).json({
      message: 'Bot flow created successfully',
      flow: formatFlow(newFlow),
    });
  } catch (error: any) {
    console.error('[BotFlowController] createBotFlow error:', error);
    res.status(500).json({ error: error.message || 'Failed to create bot flow' });
  }
};

// 4. UPDATE BOT FLOW
export const updateBotFlow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const {
      name,
      description,
      channel,
      trigger,
      triggerType,
      triggerConfig,
      steps,
      enabled,
    } = req.body;

    const flow = await BotFlow.findOne({ _id: id, organizationId: orgId });
    if (!flow) {
      res.status(404).json({ error: 'Bot flow not found' });
      return;
    }

    if (name !== undefined) flow.name = name;
    if (description !== undefined) flow.description = description;
    if (channel !== undefined) flow.channel = channel;
    if (trigger !== undefined) flow.trigger = trigger;
    if (triggerType !== undefined) flow.triggerType = triggerType;
    if (triggerConfig !== undefined) flow.triggerConfig = triggerConfig;
    if (enabled !== undefined) flow.enabled = enabled;

    if (Array.isArray(steps)) {
      flow.steps = steps.map((s: any, idx: number) => ({
        id: s.id || `s-${idx + 1}`,
        stepNumber: s.stepNumber || idx + 1,
        stepType: s.stepType || 'send_message',
        content: s.content || '',
        options: s.options || [],
        delaySeconds: s.delaySeconds || 0,
      }));
      flow.stepsCount = flow.steps.length;
    }

    await flow.save();

    res.status(200).json({
      message: 'Bot flow updated successfully',
      flow: formatFlow(flow),
    });
  } catch (error: any) {
    console.error('[BotFlowController] updateBotFlow error:', error);
    res.status(500).json({ error: error.message || 'Failed to update bot flow' });
  }
};

// 5. TOGGLE BOT FLOW STATUS (ACTIVE / PAUSED)
export const toggleBotFlow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const flow = await BotFlow.findOne({ _id: id, organizationId: orgId });
    if (!flow) {
      res.status(404).json({ error: 'Bot flow not found' });
      return;
    }

    flow.enabled = !flow.enabled;
    await flow.save();

    res.status(200).json({
      message: flow.enabled ? 'Bot flow activated' : 'Bot flow paused',
      enabled: flow.enabled,
      flow: formatFlow(flow),
    });
  } catch (error: any) {
    console.error('[BotFlowController] toggleBotFlow error:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle bot flow' });
  }
};

// 6. DELETE BOT FLOW
export const deleteBotFlow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const flow = await BotFlow.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!flow) {
      res.status(404).json({ error: 'Bot flow not found' });
      return;
    }

    res.status(200).json({
      message: 'Bot flow deleted successfully',
      id,
    });
  } catch (error: any) {
    console.error('[BotFlowController] deleteBotFlow error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete bot flow' });
  }
};

// 7. TEST / SIMULATE FLOW TRIGGER
export const testBotFlow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const flow = await BotFlow.findOne({ _id: id, organizationId: orgId });
    if (!flow) {
      res.status(404).json({ error: 'Bot flow not found' });
      return;
    }

    // Increment simulated trigger stats
    await BotFlow.updateOne(
      { _id: flow._id },
      {
        $inc: { 'stats.totalTriggered': 1, 'stats.totalCompleted': 1 },
        $set: { 'stats.lastTriggeredAt': new Date() },
      }
    );

    res.status(200).json({
      message: `Trigger simulated for flow: ${flow.name}`,
      flowName: flow.name,
      channel: flow.channel,
      executedSteps: flow.steps.length,
      sampleResponse: flow.steps[0]?.content || 'Flow triggered successfully',
    });
  } catch (error: any) {
    console.error('[BotFlowController] testBotFlow error:', error);
    res.status(500).json({ error: error.message || 'Failed to test bot flow' });
  }
};
