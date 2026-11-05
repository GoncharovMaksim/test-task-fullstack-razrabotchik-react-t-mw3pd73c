'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BuildingObject, Task, TaskStatus } from '@/types';
import { getCRMStore } from '@/lib/storage';
import { useAuth } from './AuthContext';

interface CRMContextType {
  objects: BuildingObject[];
  tasks: Task[];
  activeTask: Task | null;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  openTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  createObject: (title: string, address: string) => Promise<BuildingObject>;
  updateObject: (id: string, title?: string, address?: string) => Promise<BuildingObject>;
  deleteObject: (id: string) => Promise<void>;
  createTask: (data: {
    object_id: string;
    title: string;
    description?: string;
    assignee_id?: string | null;
  }) => Promise<Task>;
  updateTaskDetails: (
    id: string,
    data: {
      title?: string;
      description?: string;
      assignee_id?: string | null;
      object_id?: string;
    }
  ) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  transitionStatus: (
    taskId: string,
    newStatus: TaskStatus,
    comment?: string | null
  ) => Promise<Task>;
  resetDatabase: () => void;
  refresh: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [objects, setObjects] = useState<BuildingObject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!currentUser) {
      setObjects([]);
      setTasks([]);
      setActiveTask(null);
      return;
    }
    const store = getCRMStore();
    const currentObjects = store.getObjects(currentUser);
    const currentTasks = store.getTasks(currentUser);
    setObjects(currentObjects);
    setTasks(currentTasks);

    if (activeTask) {
      const refreshedTask = store.getTaskById(activeTask.id, currentUser);
      setActiveTask(refreshedTask);
    }
  }, [currentUser, activeTask?.id]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const openTaskModal = (task: Task) => {
    if (!currentUser) return;
    const store = getCRMStore();
    const fresh = store.getTaskById(task.id, currentUser);
    setActiveTask(fresh || task);
  };

  const closeTaskModal = () => {
    setActiveTask(null);
  };

  const createObject = async (title: string, address: string) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    const created = store.createObject({ title, address }, currentUser);
    loadData();
    return created;
  };

  const updateObject = async (id: string, title?: string, address?: string) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    const updated = store.updateObject(id, { title, address }, currentUser);
    loadData();
    return updated;
  };

  const deleteObject = async (id: string) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    store.deleteObject(id, currentUser);
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
    loadData();
  };

  const createTask = async (data: {
    object_id: string;
    title: string;
    description?: string;
    assignee_id?: string | null;
  }) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    const created = store.createTask(data, currentUser);
    loadData();
    return created;
  };

  const updateTaskDetails = async (
    id: string,
    data: {
      title?: string;
      description?: string;
      assignee_id?: string | null;
      object_id?: string;
    }
  ) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    const updated = store.updateTaskDetails(id, data, currentUser);
    loadData();
    if (activeTask?.id === id) {
      setActiveTask(updated);
    }
    return updated;
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    store.deleteTask(id, currentUser);
    if (activeTask?.id === id) {
      setActiveTask(null);
    }
    loadData();
  };

  const transitionStatus = async (
    taskId: string,
    newStatus: TaskStatus,
    comment?: string | null
  ) => {
    if (!currentUser) throw new Error('Пользователь не авторизован');
    const store = getCRMStore();
    const updated = store.transitionTaskStatus(taskId, newStatus, currentUser, comment);
    loadData();
    if (activeTask?.id === taskId) {
      setActiveTask(updated);
    }
    return updated;
  };

  const resetDatabase = () => {
    const store = getCRMStore();
    store.resetToDefaults();
    loadData();
  };

  return (
    <CRMContext.Provider
      value={{
        objects,
        tasks,
        activeTask,
        selectedObjectId,
        setSelectedObjectId,
        openTaskModal,
        closeTaskModal,
        createObject,
        updateObject,
        deleteObject,
        createTask,
        updateTaskDetails,
        deleteTask,
        transitionStatus,
        resetDatabase,
        refresh: loadData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
