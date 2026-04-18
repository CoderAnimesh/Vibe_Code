/**
 * Returns an avatar URL for a user.
 * - If the user has a Google photo → use it
 * - Otherwise → generate a unique DiceBear avatar based on name/email
 */
export function getAvatarUrl(user, size = 128) {
  if (user?.photoURL) return user.photoURL;
  // Seed from displayName or email so the avatar is consistent per user
  const seed = encodeURIComponent(user?.displayName || user?.email || 'user');
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&size=${size}&backgroundColor=6366f1,4f46e5,7c3aed&backgroundType=gradientLinear`;
}

/**
 * Generates an initials-based background color from a string
 */
export function getAvatarColor(name = '') {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
