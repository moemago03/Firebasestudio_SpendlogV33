import React, { useMemo, useState } from 'react';
import { Trip } from '../types';
import { ADJUSTMENT_CATEGORY, COUNTRY_TO_CODE, FLAG_SVGS } from '../utils/constants';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatisticsProps {
    trip: Trip;
}

const Statistics: React.FC<StatisticsProps> = ({ trip }) => {
    const [chartType, setChartType] = useState('category'); // 'category', 'daily', 'country'

    const data = useMemo(() => {
        const expenses = (trip.expenses || []).filter(exp => exp.category !== ADJUSTMENT_CATEGORY);

        if (chartType === 'category') {
            const categoryTotals: { [key: string]: number } = {};
            expenses.forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });
            const labels = Object.keys(categoryTotals);
            const values = Object.values(categoryTotals);
            return {
                labels,
                datasets: [{
                    label: 'Spesa per Categoria',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }]
            };
        }

        if (chartType === 'daily') {
            const dailyTotals: { [key: string]: number } = {};
            expenses.forEach(expense => {
                const date = new Date(expense.date).toLocaleDateString();
                dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
            });
            const labels = Object.keys(dailyTotals).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
            const values = labels.map(label => dailyTotals[label]);
            return {
                labels,
                datasets: [{
                    label: 'Spesa Giornaliera',
                    data: values,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                }]
            };
        }
        
        if (chartType === 'country') {
            const countryTotals: { [key: string]: number } = {};
            expenses.forEach(expense => {
                if (expense.country) {
                    countryTotals[expense.country] = (countryTotals[expense.country] || 0) + expense.amount;
                }
            });
            const labels = Object.keys(countryTotals);
            const values = Object.values(countryTotals);
            return {
                labels,
                datasets: [{
                    label: 'Spesa per Paese',
                    data: values,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                }]
            };
        }

        return {
            labels: [],
            datasets: []
        };

    }, [trip.expenses, chartType]);

    return (
        <div className="p-4 bg-surface-container-lowest rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-on-surface">Statistiche</h2>
                <select 
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)} 
                    className="bg-surface p-2 rounded-md shadow">
                    <option value="category">Per Categoria</option>
                    <option value="daily">Giornaliera</option>
                     {trip.countries && trip.countries.length > 1 && <option value="country">Per Paese</option>}
                </select>
            </div>

            <div style={{height: '300px'}}>
                 <Bar 
                    data={data} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: {
                                display: true,
                                text: `Spesa Totale ${chartType === 'category' ? 'per Categoria' : (chartType === 'daily' ? 'Giornaliera' : 'per Paese')}`
                            }
                        }
                    }}
                 />
            </div>
        </div>
    );
};

export default Statistics;
