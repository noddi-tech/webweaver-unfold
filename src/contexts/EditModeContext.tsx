import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditModeContextType {
  editMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => setEditMode(prev => !prev);

  return (
    <EditModeContext.Provider value={{ editMode, toggleEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
}
