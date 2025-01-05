type Permission = {
  action_id: string;
  action_name: string;
  entity_name: string;
  hasPermission: boolean;
};

type User = {
  user_id: number;
  name: string;
  role: string; // Single role per user
};

type Context = {
  [key: string]: any; // Additional context, if needed
};

export function hasPermission(
  permissions: Permission[],
  user: User,
  entityName: string,
  actionName: string,
  context?: Context
): boolean {
  // Find the relevant permission for the user's role, entity, and action
  const permission = permissions.find(
    (perm) =>
      perm.entity_name === entityName &&
      perm.action_name === actionName &&
      perm.hasPermission
  );

  // If no permission matches, return false
  if (!permission) return false;

  // Add optional context-based checks if needed
  if (context?.checkCondition) {
    return context.checkCondition(permission, user);
  }

  return true;
}
