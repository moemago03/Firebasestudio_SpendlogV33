import React from 'react';
import { useData } from '../../context/DataContext';
import { isSameDay } from 'date-fns';
import { ADJUSTMENT_CATEGORY } from '../../utils/constants';

const SummaryHeader: React.FC<{ activeTripId: string }> = ({ activeTripId }) => {
    const { data } = useData();
    const trip = data?.trips.find(t => t.id === activeTripId);

    if (!trip) return null;

    const today = new Date();
    const expensesToday = (trip.expenses || [])
        .filter(exp => isSameDay(new Date(exp.date), today) && exp.category !== ADJUSTMENT_CATEGORY)
        .reduce((sum, exp) => sum + exp.amount, 0);

    const totalBudget = trip.budget || 0;
    const totalSpent = (trip.expenses || [])
        .filter(exp => exp.category !== ADJUSTMENT_CATEGORY)
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    const remainingBudget = totalBudget - totalSpent;

    return (
        <header className="bg-primary text-on-primary p-4 rounded-b-2xl shadow-md">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">{trip.name}</h1>
                <div className="text-right">
                    <p className="text-lg">{trip.destination}</p>
                    <p className="text-sm opacity-80">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm opacity-80">Speso Oggi</p>
                    <p className="text-xl font-semibold">{expensesToday.toFixed(2)} {trip.currency}</p>
                </div>
                <div>
                    <p className="text-sm opacity-80">Budget Rimanente</p>
                    <p className={`text-xl font-semibold ${remainingBudget < 0 ? 'text-red-400' : ''}`}>
                        {remainingBudget.toFixed(2)} {trip.currency}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default SummaryHeader;
