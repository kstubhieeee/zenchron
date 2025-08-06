"use client";

import React from 'react';
import { TaskStatus } from '@/lib/models/Task';

interface KanbanColumnProps {
  title: string;
  color: string;
  status: TaskStatus;
  children: React.ReactNode;
}

const getColumnStyles = (color: string) => {
  switch (color) {
    case 'bg-slate-100':
      return { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' };
    case 'bg-blue-100':
      return { backgroundColor: '#dbeafe', borderColor: '#93c5fd' };
    case 'bg-amber-100':
      return { backgroundColor: '#fef3c7', borderColor: '#fcd34d' };
    case 'bg-emerald-100':
      return { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' };
    default:
      return { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' };
  }
};

export function KanbanColumn({ title, color, children }: KanbanColumnProps) {
  const styles = getColumnStyles(color);
  
  return (
    <div 
      className="flex flex-col h-full rounded-lg  overflow-hidden"
      style={{ border: `1px solid ${styles.borderColor}` }}
    >
      <div 
        className="px-4 py-3"
        style={{ 
          backgroundColor: styles.backgroundColor,
          borderBottom: `1px solid ${styles.borderColor}`
        }}
      >
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div 
        className="flex-1 p-3 space-y-3 min-h-[400px] overflow-y-auto"
        style={{ backgroundColor: '#fafafa' }}
      >
        {children}
      </div>
    </div>
  );
}
