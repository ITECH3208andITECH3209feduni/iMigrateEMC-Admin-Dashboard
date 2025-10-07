import React, { useState } from 'react';
import Header from './Header';
import BookingsTable from './BookingsTable';
import LiveChat from './LiveChat';
import UserManagement from './UserManagement';
import PartnerEOITable from './PartnerEOITable';
import AdminTools from './AdminTools';

interface DashboardProps {
    onSignOut: () => void;
}

const tabs = [
    { id: 'bookings', label: 'Bookings' },
    { id: 'partner-eoi', label: 'Partner EOIs' },
    { id: 'live-chat', label: 'Live Chat' },
    { id: 'services', label: 'Manage Services' },
    { id: 'users', label: 'User Management' },
];

const Dashboard: React.FC<DashboardProps> = ({ onSignOut }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return (
        <div>
            <Header onSignOut={onSignOut} />
            <main>
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                aria-current={activeTab === tab.id ? 'page' : undefined}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-8">
                    {activeTab === 'bookings' && <BookingsTable />}
                    {activeTab === 'partner-eoi' && <PartnerEOITable />}
                    {activeTab === 'live-chat' && <LiveChat />}
                    {activeTab === 'services' && <AdminTools />}
                    {activeTab === 'users' && <UserManagement />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;