export const ACTIONS = Object.freeze({
  health: { risk: "read", enabled: true },
  state: { risk: "read", enabled: true },
  task_preview: { risk: "read", enabled: true },
  browser_open: { risk: "write_external", enabled: false },
  ui_click: { risk: "write_external", enabled: false },
  ui_type: { risk: "write_external", enabled: false },
  shell: { risk: "privileged", enabled: false },
  credentials: { risk: "sensitive", enabled: false },
  payment: { risk: "financial", enabled: false },
  publish: { risk: "external_release", enabled: false },
  delete: { risk: "destructive", enabled: false }
});

export function authorize(action) {
  const rule = ACTIONS[String(action)];
  if (!rule) return { ok: false, code: "ACTION_NOT_ALLOWLISTED" };
  if (!rule.enabled) return { ok: false, code: "ACTION_DISABLED", risk: rule.risk };
  return { ok: true, risk: rule.risk };
}
