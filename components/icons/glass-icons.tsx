import React from 'react';

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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M7 9h10M7 12h8M7 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5.5" cy="9" r="0.5" fill="currentColor" />
        <circle cx="5.5" cy="12" r="0.5" fill="currentColor" />
        <circle cx="5.5" cy="15" r="0.5" fill="currentColor" />
    </svg>
);

export const AIIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="15" cy="9" r="1.5" fill="currentColor" fillOpacity="0.3" />
        <path d="M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const GmailIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M2 8l8.5 5a2 2 0 003 0L22 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CalendarIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="14" r="1" fill="currentColor" />
        <circle cx="12" cy="14" r="1" fill="currentColor" />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
    </svg>
);

export const SettingsIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

export const LogoutIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const RobotIcon = ({ className = "", size = 24 }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <title>tab-close</title>
        <g fill="none">
            <path d="M3.74254 13.9701C3.319 12.276 3.10723 11.4289 3.31342 10.7618C3.49413 10.1771 3.88305 9.67897 4.40647 9.36184C5.00367 9 5.87682 9 7.62311 9H16.3769C18.1232 9 18.9963 9 19.5935 9.36184C20.117 9.67897 20.5059 10.1771 20.6866 10.7618C20.8928 11.4289 20.681 12.276 20.2575 13.9701C19.9866 15.0535 19.8512 15.5951 19.5492 15.9984C19.2828 16.3543 18.9263 16.6327 18.5164 16.8048C18.0519 17 17.4936 17 16.3769 17H7.62311C6.50643 17 5.9481 17 5.48359 16.8048C5.07375 16.6327 4.71723 16.3543 4.45078 15.9984C4.14878 15.5951 4.01337 15.0535 3.74254 13.9701Z" fill="url(#1752500502807-314708_tab-close_existing_0_d6plaw7wk)" data-glass="origin" mask="url(#1752500502807-314708_tab-close_mask_2u8tfaqyx)"></path>
            <path d="M3.74254 13.9701C3.319 12.276 3.10723 11.4289 3.31342 10.7618C3.49413 10.1771 3.88305 9.67897 4.40647 9.36184C5.00367 9 5.87682 9 7.62311 9H16.3769C18.1232 9 18.9963 9 19.5935 9.36184C20.117 9.67897 20.5059 10.1771 20.6866 10.7618C20.8928 11.4289 20.681 12.276 20.2575 13.9701C19.9866 15.0535 19.8512 15.5951 19.5492 15.9984C19.2828 16.3543 18.9263 16.6327 18.5164 16.8048C18.0519 17 17.4936 17 16.3769 17H7.62311C6.50643 17 5.9481 17 5.48359 16.8048C5.07375 16.6327 4.71723 16.3543 4.45078 15.9984C4.14878 15.5951 4.01337 15.0535 3.74254 13.9701Z" fill="url(#1752500502807-314708_tab-close_existing_0_d6plaw7wk)" data-glass="clone" filter="url(#1752500502807-314708_tab-close_filter_vawaufhq9)" clip-path="url(#1752500502807-314708_tab-close_clipPath_2cw8llko2)"></path>
            <path d="M18.1206 12C19.7931 12 20.6296 12.0002 21.2153 12.3438C21.729 12.6451 22.1183 13.1198 22.313 13.6826C22.535 14.3243 22.3714 15.1444 22.0435 16.7842L21.6431 18.7842C21.414 19.9294 21.2994 20.5023 21.0005 20.9307C20.7368 21.3084 20.3738 21.6065 19.9517 21.791C19.473 22.0002 18.889 22 17.7212 22H6.27881C5.11104 22 4.52699 22.0002 4.04834 21.791C3.62619 21.6065 3.26321 21.3084 2.99951 20.9307C2.70059 20.5023 2.58598 19.9294 2.35693 18.7842L1.95654 16.7842C1.62858 15.1444 1.46501 14.3243 1.68701 13.6826C1.88174 13.1198 2.27097 12.6451 2.78467 12.3438C3.37042 12.0002 4.20688 12 5.87939 12H18.1206ZM14.2104 1.5C15.1993 1.50002 15.7967 2.59393 15.2622 3.42578L13.0513 6.86426C12.5592 7.62964 11.4408 7.62965 10.9487 6.86426L8.73779 3.42578C8.20331 2.59393 8.80072 1.50003 9.78955 1.5H14.2104Z" fill="url(#1752500502807-314708_tab-close_existing_1_kn9yczko7)" data-glass="blur"></path>
            <path d="M19.2277 12.0049C20.1957 12.021 20.7757 12.0862 21.215 12.3438C21.7287 12.6451 22.1189 13.1197 22.3136 13.6826C22.5356 14.3243 22.371 15.1444 22.0431 16.7842L21.6437 18.7842L21.4884 19.543C21.3455 20.2073 21.2244 20.6094 21.0001 20.9307C20.7364 21.3084 20.3734 21.6065 19.9513 21.791L19.7667 21.8594C19.3182 21.9997 18.7432 22 17.7208 22V21.25C18.3159 21.25 18.7215 21.2492 19.0392 21.2256C19.3474 21.2027 19.5199 21.161 19.6515 21.1035C19.9469 20.9744 20.2013 20.7663 20.3859 20.502C20.468 20.3843 20.5432 20.2234 20.6261 19.9258C20.7115 19.619 20.7907 19.221 20.9073 18.6377L21.3077 16.6377C21.4744 15.8044 21.589 15.2264 21.6388 14.7764C21.6878 14.333 21.6628 14.096 21.6046 13.9277C21.4683 13.5337 21.1957 13.2012 20.8361 12.9902C20.6825 12.9002 20.4551 12.8289 20.0109 12.79C19.5599 12.7506 18.9708 12.75 18.1212 12.75H5.87903C5.02941 12.75 4.44038 12.7506 3.98938 12.79C3.54515 12.8289 3.31777 12.9002 3.16418 12.9902C2.80456 13.2012 2.53195 13.5337 2.39563 13.9277C2.33741 14.096 2.31241 14.333 2.36145 14.7764C2.41125 15.2264 2.52585 15.8044 2.6925 16.6377L3.09289 18.6377C3.20956 19.221 3.28871 19.619 3.37414 19.9258C3.45703 20.2234 3.53223 20.3843 3.61438 20.502C3.79895 20.7663 4.0533 20.9744 4.34875 21.1035C4.48029 21.161 4.65283 21.2027 4.96106 21.2256C5.27871 21.2492 5.68435 21.25 6.27942 21.25V22L5.505 21.9971C4.93865 21.9889 4.55388 21.9596 4.23352 21.8594L4.04895 21.791C3.67937 21.6295 3.35462 21.3811 3.10266 21.0684L3.00012 20.9307C2.70108 20.5023 2.58565 19.9296 2.35657 18.7842L1.95715 16.7842C1.62919 15.1444 1.46468 14.3243 1.68664 13.6826C1.85698 13.1902 2.1766 12.7653 2.59778 12.4648L2.78528 12.3438C3.37098 12.0004 4.20697 12 5.87903 12H18.1212L19.2277 12.0049ZM17.7208 21.25V22H6.27942V21.25H17.7208Z" fill="url(#1752500502807-314708_tab-close_existing_2_pfwcahtr9)"></path>
            <path d="M9.78967 1.5H14.2104C15.1992 1.5 15.7966 2.59395 15.2621 3.42584L13.0513 6.86441C12.5901 7.58185 11.5786 7.62676 11.0484 6.99918L10.9488 6.86441L8.73795 3.42584C8.20352 2.59398 8.80091 1.50007 9.78967 1.5ZM9.78967 2.25002C9.39419 2.25009 9.15499 2.68782 9.36878 3.02055L11.5796 6.45913C11.7765 6.76504 12.2236 6.765 12.4204 6.45913L14.6313 3.02055C14.8452 2.68779 14.606 2.25002 14.2104 2.25002H9.78967Z" fill="url(#1752500502807-314708_tab-close_existing_3_aapod9yss)"></path>
            <defs>
                <linearGradient id="1752500502807-314708_tab-close_existing_0_d6plaw7wk" x1="12" y1="9" x2="12" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#575757"></stop>
                    <stop offset="1" stop-color="#151515"></stop>
                </linearGradient>
                <linearGradient id="1752500502807-314708_tab-close_existing_1_kn9yczko7" x1="12" y1="1.5" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#E3E3E5" stop-opacity=".6"></stop>
                    <stop offset="1" stop-color="#BBBBC0" stop-opacity=".6"></stop>
                </linearGradient>
                <linearGradient id="1752500502807-314708_tab-close_existing_2_pfwcahtr9" x1="12" y1="12" x2="12" y2="17.791" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#fff"></stop>
                    <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
                </linearGradient>
                <linearGradient id="1752500502807-314708_tab-close_existing_3_aapod9yss" x1="12" y1="1.5" x2="12" y2="4.939" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#fff"></stop>
                    <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
                </linearGradient>
                <filter id="1752500502807-314708_tab-close_filter_vawaufhq9" x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="2" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
                </filter>
                <clipPath id="1752500502807-314708_tab-close_clipPath_2cw8llko2">
                    <path d="M18.1206 12C19.7931 12 20.6296 12.0002 21.2153 12.3438C21.729 12.6451 22.1183 13.1198 22.313 13.6826C22.535 14.3243 22.3714 15.1444 22.0435 16.7842L21.6431 18.7842C21.414 19.9294 21.2994 20.5023 21.0005 20.9307C20.7368 21.3084 20.3738 21.6065 19.9517 21.791C19.473 22.0002 18.889 22 17.7212 22H6.27881C5.11104 22 4.52699 22.0002 4.04834 21.791C3.62619 21.6065 3.26321 21.3084 2.99951 20.9307C2.70059 20.5023 2.58598 19.9294 2.35693 18.7842L1.95654 16.7842C1.62858 15.1444 1.46501 14.3243 1.68701 13.6826C1.88174 13.1198 2.27097 12.6451 2.78467 12.3438C3.37042 12.0002 4.20688 12 5.87939 12H18.1206ZM14.2104 1.5C15.1993 1.50002 15.7967 2.59393 15.2622 3.42578L13.0513 6.86426C12.5592 7.62964 11.4408 7.62965 10.9487 6.86426L8.73779 3.42578C8.20331 2.59393 8.80072 1.50003 9.78955 1.5H14.2104Z" fill="url(#1752500502807-314708_tab-close_existing_1_kn9yczko7)"></path>
                </clipPath>
                <mask id="1752500502807-314708_tab-close_mask_2u8tfaqyx">
                    <rect width="100%" height="100%" fill="#FFF"></rect>
                    <path d="M18.1206 12C19.7931 12 20.6296 12.0002 21.2153 12.3438C21.729 12.6451 22.1183 13.1198 22.313 13.6826C22.535 14.3243 22.3714 15.1444 22.0435 16.7842L21.6431 18.7842C21.414 19.9294 21.2994 20.5023 21.0005 20.9307C20.7368 21.3084 20.3738 21.6065 19.9517 21.791C19.473 22.0002 18.889 22 17.7212 22H6.27881C5.11104 22 4.52699 22.0002 4.04834 21.791C3.62619 21.6065 3.26321 21.3084 2.99951 20.9307C2.70059 20.5023 2.58598 19.9294 2.35693 18.7842L1.95654 16.7842C1.62858 15.1444 1.46501 14.3243 1.68701 13.6826C1.88174 13.1198 2.27097 12.6451 2.78467 12.3438C3.37042 12.0002 4.20688 12 5.87939 12H18.1206ZM14.2104 1.5C15.1993 1.50002 15.7967 2.59393 15.2622 3.42578L13.0513 6.86426C12.5592 7.62964 11.4408 7.62965 10.9487 6.86426L8.73779 3.42578C8.20331 2.59393 8.80072 1.50003 9.78955 1.5H14.2104Z" fill="#000"></path>
                </mask>
            </defs>
        </g>
    </svg>
);