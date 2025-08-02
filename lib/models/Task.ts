export interface Task {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  source: TaskSource;
  dueDate?: Date;
  scheduledTime?: Date;
  estimatedDuration?: number; // in minutes
  tags: string[];
  metadata?: {
    sourceId?: string;
    sourceUrl?: string;
    attachments?: string[];
    mentions?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum TaskType {
  FOLLOW_UP = 'follow_up',
  QUICK_WIN = 'quick_win',
  HIGH_PRIORITY = 'high_priority',
  DEEP_WORK = 'deep_work',
  DEADLINE_BASED = 'deadline_based',
  RECURRING = 'recurring',
  SCHEDULED_EVENT = 'scheduled_event',
  REFERENCE_INFO = 'reference_info',
  WAITING_BLOCKED = 'waiting_blocked',
  CUSTOM = 'custom'
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskSource {
  MANUAL = 'manual',
  SLACK = 'slack',
  GMAIL = 'gmail',
  NOTION = 'notion',
  CALENDAR = 'calendar',
  VOICE = 'voice'
}

export const TaskTypeConfig = {
  [TaskType.FOLLOW_UP]: {
    label: 'Follow-Up',
    emoji: '🔁',
    color: 'bg-blue-100 text-blue-800',
    description: 'Tasks requiring follow-up or response'
  },
  [TaskType.QUICK_WIN]: {
    label: 'Quick Win',
    emoji: '💡',
    color: 'bg-green-100 text-green-800',
    description: 'Simple tasks that can be completed quickly'
  },
  [TaskType.HIGH_PRIORITY]: {
    label: 'High Priority',
    emoji: '🔥',
    color: 'bg-red-100 text-red-800',
    description: 'Urgent tasks requiring immediate attention'
  },
  [TaskType.DEEP_WORK]: {
    label: 'Deep Work',
    emoji: '🧠',
    color: 'bg-purple-100 text-purple-800',
    description: 'Complex tasks requiring focused attention'
  },
  [TaskType.DEADLINE_BASED]: {
    label: 'Deadline-Based',
    emoji: '⏳',
    color: 'bg-orange-100 text-orange-800',
    description: 'Tasks with specific deadlines'
  },
  [TaskType.RECURRING]: {
    label: 'Recurring',
    emoji: '🔁',
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Repeating tasks or habits'
  },
  [TaskType.SCHEDULED_EVENT]: {
    label: 'Scheduled Event',
    emoji: '📅',
    color: 'bg-cyan-100 text-cyan-800',
    description: 'Time-specific events or meetings'
  },
  [TaskType.REFERENCE_INFO]: {
    label: 'Reference/Info',
    emoji: '📎',
    color: 'bg-gray-100 text-gray-800',
    description: 'Information for reference only'
  },
  [TaskType.WAITING_BLOCKED]: {
    label: 'Waiting/Blocked',
    emoji: '⏳',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Tasks waiting for external input'
  },
  [TaskType.CUSTOM]: {
    label: 'Custom',
    emoji: '⚡',
    color: 'bg-pink-100 text-pink-800',
    description: 'Custom categorized tasks'
  }
};