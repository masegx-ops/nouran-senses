// Nouran Supervisor v1
// Creates explicit work packets for role-based workers. It does not spawn hidden processes.

import roles from './agent-roles.json' with { type: 'json' };
import { appendEvent } from './portable-core.mjs';

const roleSet = new Set(roles.roles.map(r => r.id));

export function makePacket(role, task, context = {}, constraints = []) {
  if (!roleSet.has(role)) throw new Error(`Unknown agent role: ${role}`);
  return {
    packetId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    role,
    task: String(task),
    context,
    constraints: [...constraints, 'Return evidence class', 'Return exact artifacts or errors', 'Do not claim unseen execution']
  };
}

export function planPipeline(state, nextExperiment) {
  const packets = [
    makePacket('researcher', `Verify the external prerequisites for ${nextExperiment.routeId}.`, { route: nextExperiment }),
    makePacket('builder', `Prepare the smallest reversible adapter/test for ${nextExperiment.routeId}.`, { route: nextExperiment }),
    makePacket('tester', `Run the pre-registered controls for ${nextExperiment.routeId}.`, { route: nextExperiment }),
    makePacket('auditor', `Classify all returned evidence for ${nextExperiment.routeId}.`, { route: nextExperiment }),
    makePacket('archivist', 'Compress results while retaining provenance and failures.', { route: nextExperiment })
  ];
  appendEvent(state, 'agent_pipeline_planned', { routeId: nextExperiment.routeId, packetIds: packets.map(p => p.packetId) }, 'supervisor');
  return packets;
}
