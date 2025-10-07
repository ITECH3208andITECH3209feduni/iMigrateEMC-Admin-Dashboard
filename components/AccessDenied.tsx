import React from 'react';

interface AccessDeniedProps {
    onSignOut: () => void;
}

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);


const AccessDenied: React.FC<AccessDeniedProps> = ({ onSignOut }) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center mt-16">
            <LockIcon className="w-16 h-16 mx-auto text-red-500" />
            <h2 className="text-2xl font-semibold text-gray-800 mt-4">Access Denied</h2>
            <p className="text-gray-600 mt-2">You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.</p>
            <button
                onClick={onSignOut}
                className="mt-6 w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
};

export default AccessDenied;
