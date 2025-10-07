import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
            <div className="text-center p-8">
                <div className="mb-8">
                    <h1 className="text-5xl font-bold tracking-tight">
                        <span className="font-light text-gray-700">iMigrate</span>
                        <span className="text-blue-600">EMC</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Admin Dashboard</p>
                </div>
                
                <div className="w-full max-w-xs mx-auto">
                     <div className="relative pt-1">
                        <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-blue-200">
                            <div className="w-full shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 animate-progress"></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Initializing session...</p>
                </div>
            </div>
             <style>{`
                @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%) scaleX(0.5); }
                    50% { transform: translateX(0) scaleX(0.2); }
                    100% { transform: translateX(100%) scaleX(0.5); }
                }
                .animate-progress {
                    transform-origin: left;
                    animation: progress-indeterminate 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
