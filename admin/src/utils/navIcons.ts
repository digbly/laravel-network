import {
  BookOpen,
  Circle,
  FolderTree,
  Images,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps the `icon` names sent by the navigation API to lucide-react components.
 * Register new icons here when a backend menu introduces one.
 */
const NAV_ICONS: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'folder-tree': FolderTree,
  images: Images,
  'layout-dashboard': LayoutDashboard,
  'message-square': MessageSquare,
  newspaper: Newspaper,
  settings: Settings,
  users: Users,
};

export const resolveNavIcon = (name: string): LucideIcon => NAV_ICONS[name] ?? Circle;
