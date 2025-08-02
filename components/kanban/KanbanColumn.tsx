"use client";

import React from 'react';
import { TaskStatus } from '@/lib/models/Task';

interface KanbanColumnProps {
  title: string;
  color: string;
  status: TaskStatus;
  children: React.ReactNode;
}

export function KanbanColumn({ title, color, children }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <div className={`${color} rounded-t-lg px-4 py-3 border-b`}>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="flex-1 bg-gray-50 rounded-b-lg p-4 space-y-3 min-h-[400px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}