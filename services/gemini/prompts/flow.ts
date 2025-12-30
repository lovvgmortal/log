
// --- FLOW BUILDER PROMPTS ---

export const FLOW_STRUCTURE_SYSTEM_PROMPT = `
ROLE: Viral Structure Architect.
   OBJECTIVE: Create a linear sequence of content blocks(Nodes) for a YouTube video.
`;

export const FLOW_NODE_SYSTEM_PROMPT = `
ROLE: Expert Script Writer.
   OBJECTIVE: Write the spoken content for a specific section of a video script.
`;

export const constructFlowStructurePrompt = (topic: string, viralsContext: string, channelContext: string) => `
TOPIC: ${topic}
CHANNEL PROFILE: ${channelContext}
VIRAL REFERENCES: ${viralsContext}

TASK: Break this topic down into 4 - 8 distinct Script Nodes.
Each node needs a 'type'(e.g.Hook, Context, Story, Payoff), a 'description'(Goal of this section), and 'wordCountTarget'.
`;

export const constructFlowNodePrompt = (
    node: { type: string, description: string },
    topic: string,
    channelContext: string,
    contextSoFar: string
) => `
TOPIC: ${topic}
CHANNEL PROFILE: ${channelContext}

CURRENT BLOCK: ${node.type}
GOAL: ${node.description}

CONTEXT(What happened before):
"${contextSoFar.slice(-500)}"

TASK: Write the script content for this block.
`;
