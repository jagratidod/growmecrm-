import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { BotFlow, IBotFlow, IBotStep } from '../models/BotFlow';

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

// 1. GET ALL BOT FLOWS FOR LOGGED IN TENANT 
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

    const flows = await BotFlow.find(filter).sort({ createdAt: 1 });

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

