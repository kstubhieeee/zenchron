"use client";

import { useState } from "react";

interface SyncDialogState {
  isOpen: boolean;
  success: boolean;
  title: string;
  message: string;
  details?: string;
}

export function useSyncDialog() {
  const [dialogState, setDialogState] = useState<SyncDialogState>({
    isOpen: false,
    success: false,
    title: "",
    message: "",
    details: undefined,
  });

  const showSuccess = (title: string, message: string, details?: string) => {
    setDialogState({
      isOpen: true,
      success: true,
      title,
      message,
      details,
    });
  };

  const showError = (title: string, message: string, details?: string) => {
    setDialogState({
      isOpen: true,
      success: false,
      title,
      message,
      details,
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    dialogState,
    showSuccess,
    showError,
    closeDialog,
  };
}