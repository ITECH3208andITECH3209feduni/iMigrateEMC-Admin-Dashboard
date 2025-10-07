
import React from 'react';

interface HeaderProps {
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignOut }) => {
    return (
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Booking Dashboard</h1>
                <p className="text-gray-600 mt-1">A complete overview of all scheduled appointments.</p>
            </div>
            <button 
                onClick={onSignOut}
                className="bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
                Sign Out
            </button>
        </header>
    );
};

export default Header;
