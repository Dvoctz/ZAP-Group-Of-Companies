
import React from 'react';
import { Company } from './types';

const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const PerfumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.36-.662a2 2 0 01-1.536-1.536l-.662-2.36a2 2 0 00-.547-1.022l-1.414-1.414a2 2 0 00-2.828 0L7.636 9.293a2 2 0 00-1.022.547l-.662 2.36a2 2 0 01-1.536 1.536l-2.36.662a2 2 0 00-.547 1.022l-1.414 1.414a2 2 0 000 2.828l1.414 1.414a2 2 0 001.022.547l2.36.662a2 2 0 011.536 1.536l.662 2.36a2 2 0 00.547 1.022l1.414 1.414a2 2 0 002.828 0l1.414-1.414a2 2 0 00.547-1.022l.662-2.36a2 2 0 011.536-1.536l2.36-.662a2 2 0 001.022-.547l1.414-1.414a2 2 0 000-2.828l-1.414-1.414z" />
    </svg>
);

const GadgetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export const COMPANIES: Company[] = [
    {
        name: 'ZAP Stationers',
        slug: 'zap-stationers',
        description: 'Quality pens, paper, and office supplies.',
        icon: <PenIcon />,
        isExternal: false,
    },
    {
        name: 'ZAP Fragrances',
        slug: 'zap-fragrances',
        description: 'Exquisite perfumes and scents for every occasion.',
        icon: <PerfumeIcon />,
        isExternal: false,
    },
    {
        name: 'ZAP Gadgets',
        slug: 'zap-gadgets',
        description: 'The latest in tech and electronic gadgets.',
        icon: <GadgetIcon />,
        isExternal: false,
    },
    {
        name: 'ZAP Photography',
        slug: 'zap-photography',
        description: 'Professional photography services and prints.',
        icon: <CameraIcon />,
        isExternal: true,
        externalLink: '#', // Admin can update this link later
    },
];
