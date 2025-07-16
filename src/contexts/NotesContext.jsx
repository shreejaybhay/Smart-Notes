"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const refreshNotesRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  const setRefreshNotes = useCallback((refreshFn) => {
    refreshNotesRef.current = refreshFn;
  }, []);

  const triggerRefresh = useCallback(() => {
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Debounce the refresh to avoid excessive API calls
    refreshTimeoutRef.current = setTimeout(() => {
      if (refreshNotesRef.current) {
        refreshNotesRef.current();
      }
    }, 100); // 100ms debounce
  }, []);

  const contextValue = React.useMemo(
    () => ({
      setRefreshNotes,
      triggerRefresh,
    }),
    [setRefreshNotes, triggerRefresh]
  );

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
