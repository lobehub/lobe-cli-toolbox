export interface Label {
  color: string;
  description?: string | null;
  name: string;
}

export interface LabelSyncPlan {
  create: Label[];
  remove: Label[];
  /** `from` is the current target label, `to` the source label it is updated to. */
  update: { from: Label; to: Label }[];
}

const key = (name: string) => name.toLowerCase();

const isSame = (a: Label, b: Label) =>
  a.name === b.name &&
  a.color.toLowerCase() === b.color.toLowerCase() &&
  (a.description || '') === (b.description || '');

/**
 * Plans how to make the target labels match the source. Labels with the same name (GitHub
 * compares names case-insensitively) are updated in place, so issues keep them.
 */
export const planLabelSync = (source: Label[], target: Label[]): LabelSyncPlan => {
  const targetByName = new Map(target.map((label) => [key(label.name), label]));
  const sourceNames = new Set(source.map((label) => key(label.name)));
  const plan: LabelSyncPlan = { create: [], remove: [], update: [] };

  for (const label of source) {
    const existing = targetByName.get(key(label.name));
    if (!existing) plan.create.push(label);
    else if (!isSame(existing, label)) plan.update.push({ from: existing, to: label });
  }

  plan.remove = target.filter((label) => !sourceNames.has(key(label.name)));
  return plan;
};
