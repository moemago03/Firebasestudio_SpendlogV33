import React from 'react';
import { Trip } from '../../types';
import { ADJUSTMENT_CATEGORY } from '../../utils/constants';

interface BudgetProgressProps {
    trip: Trip;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ trip }) => {
    if (!trip.budget) return null;

    const totalSpent = (trip.expenses || [])
        .filter(exp => exp.category !== ADJUSTMENT_CATEGORY)
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    const budgetPercentage = Math.min((totalSpent / trip.budget) * 100, 100);

    const getProgressBarColor = () => {
        if (budgetPercentage > 90) return 'bg-error';
        if (budgetPercentage > 75) return 'bg-warning';
        return 'bg-primary';
    };

    return (
        <div className="my-4 p-4 bg-surface-variant rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-on-surface-variant">Budget</h3>
                <p className="text-sm font-medium text-on-surface-variant">
                    <span className="font-bold">{totalSpent.toFixed(2)}</span> / {trip.budget.toFixed(2)} {trip.currency}
                </p>
            </div>
            <div className="w-full bg-surface rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full ${getProgressBarColor()}`}
                    style={{ width: `${budgetPercentage}%` }}
                ></div>
            </div>
             {budgetPercentage >= 100 && <p className="text-center text-error text-sm mt-2">Budget superato!</p>}
        </div>
    );
};

export default BudgetProgress;
