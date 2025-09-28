import React from 'react';
import { useData } from '../context/DataContext';
import { Trip, Member } from '../types';
import { ADJUSTMENT_CATEGORY } from '../utils/constants';

interface GroupBalancesProps {
    trip: Trip;
}

const GroupBalances: React.FC<GroupBalancesProps> = ({ trip }) => {
    const members = trip.members || [];
    if (members.length <= 1) return null;

    const balances: { [key: string]: number } = {};
    members.forEach(m => balances[m.id] = 0);

    (trip.expenses || []).forEach(expense => {
        if (expense.category === ADJUSTMENT_CATEGORY) {
            // This is a settlement, not a shared expense
            const amount = expense.amount;
            const paidById = expense.paidById;
            const paidToId = expense.splitBetweenMemberIds[0];
            if (paidById && paidToId) {
                balances[paidById] += amount;
                balances[paidToId] -= amount;
            }
        } else {
            // This is a shared expense
            const amount = expense.amount;
            const paidById = expense.paidById;
            const splitBetween = (expense.splitBetweenMemberIds || []).filter(id => members.some(m => m.id === id));
            
            if (!paidById || splitBetween.length === 0) return;

            balances[paidById] += amount;
            const share = amount / splitBetween.length;
            splitBetween.forEach(memberId => {
                balances[memberId] -= share;
            });
        }
    });

    const sortedBalances = Object.entries(balances)
        .map(([memberId, balance]) => ({ 
            member: members.find(m => m.id === memberId) as Member, 
            balance 
        }))
        .filter(item => item.member); // Filter out potential undefined members

    return (
        <div className="my-4 p-4 bg-surface-container-lowest rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-3 text-on-surface">Bilancio Gruppo</h3>
            <div className="space-y-3">
                {sortedBalances.map(({ member, balance }) => (
                    <div key={member.id} className="flex justify-between items-center bg-surface p-2 rounded-md">
                        <span className="font-medium text-on-surface-variant">{member.name}</span>
                        <span className={`font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {balance.toFixed(2)} {trip.currency}
                        </span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-on-surface-variant opacity-70 mt-3">
                Un saldo positivo significa che il gruppo ti deve dei soldi. Un saldo negativo significa che devi dei soldi al gruppo.
            </p>
        </div>
    );
};

export default GroupBalances;
