import React, { useState, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import CategoryForm from './CategoryForm';

const CategoryManager: React.FC = () => {
    const { data, addCategory, updateCategory, deleteCategory } = useData();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleSave = useCallback((category: Category) => {
        if (category.id) {
            updateCategory(category);
        } else {
            addCategory(category);
        }
        setIsFormOpen(false);
        setEditingCategory(null);
    }, [addCategory, updateCategory]);

    const handleDelete = useCallback((categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category? Expenses in this category will be moved to "Varie".')) {
            deleteCategory(categoryId);
            setIsFormOpen(false);
            setEditingCategory(null);
        }
    }, [deleteCategory]);

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Gestisci Categorie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {data?.categories.map(category => (
                    <div key={category.id} 
                         onClick={() => handleEdit(category)} 
                         className="p-3 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105" 
                         style={{ backgroundColor: category.color, color: 'white' }}>
                        <i className={`material-icons`}>{category.icon}</i>
                        <p className="font-semibold text-sm mt-1 truncate">{category.name}</p>
                    </div>
                ))}
                 <div onClick={handleAddNew} 
                      className="p-3 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 flex flex-col items-center justify-center bg-surface-variant text-on-surface-variant">
                    <i className="material-icons">add</i>
                    <p className="font-semibold text-sm mt-1">Aggiungi</p>
                </div>
            </div>

            {isFormOpen && (
                <CategoryForm
                    category={editingCategory}
                    onSave={handleSave}
                    onClose={() => setIsFormOpen(false)}
                    onDelete={editingCategory && !DEFAULT_CATEGORIES.some(c => c.id === editingCategory.id) ? handleDelete : undefined}
                />
            )}
        </div>
    );
};

export default CategoryManager;
