import React from 'react';
import Image from 'next/image';

interface IconProps {
    className?: string;
    size?: number;
}

export const DashboardIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
    </svg>
);

export const TasksIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <Image src="https://cdn-icons-png.flaticon.com/512/5581/5581393.png" alt="Google Calendar" width={size * 3} height={size * 3} />
</div>
);

export const AIIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <Image src="/gemini.svg" alt="Gmail" width={size * 0.8} height={size * 0.8} />
</div>
);

export const GmailIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Image src="/gmail.svg" alt="Gmail" width={size * 0.8} height={size * 0.8} />
    </div>
);

export const CalendarIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Image src="/calendar.svg" alt="Google Calendar" width={size * 0.8} height={size * 0.8} />
    </div>
);

export const SettingsIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <Image src="https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/256/Settings-icon.png" alt="Google Calendar" width={size } height={size } />
</div>
);

export const LogoutIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);



export const SlackIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <Image src="/slack.svg" alt="Gmail" width={size * 0.8} height={size * 0.8} />
</div>
);

export const NotionIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Image src="/notion.svg" alt="Gmail" width={size * 0.8} height={size * 0.8} />
    </div>
);

export const GMeetIcon = ({ className = "", size = 24 }: IconProps) => (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Image src="/gmeet.svg" alt="Gmail" width={size * 0.8} height={size * 0.8} />
    </div>
);