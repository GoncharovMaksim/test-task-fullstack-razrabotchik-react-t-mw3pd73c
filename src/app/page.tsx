'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { AuthScreen } from '@/components/AuthScreen';
import { Navbar } from '@/components/Navbar';
import { ObjectsView } from '@/components/ObjectsView';
import { ObjectDetailView } from '@/components/ObjectDetailView';
import { MyTasksView } from '@/components/MyTasksView';
import { SystemInfoView } from '@/components/SystemInfoModal';
import { TaskModal } from '@/components/TaskModal';
import { CreateObjectModal } from '@/components/CreateObjectModal';
import { EditObjectModal } from '@/components/EditObjectModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { BuildingObject, Task } from '@/types';

export default function Home() {
  const { currentUser, isLoading } = useAuth();
  const {
    activeTask,
    selectedObjectId,
    setSelectedObjectId,
    openTaskModal,
    closeTaskModal,
    refresh,
  } = useCRM();

  const [currentTab, setCurrentTab] = useState<'objects' | 'my-tasks' | 'info'>('objects');
  const [showCreateObject, setShowCreateObject] = useState(false);
  const [editingObject, setEditingObject] = useState<BuildingObject | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskCreationObjectId, setTaskCreationObjectId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
          Загрузка системы...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleCreateTaskForObject = (objectId: string) => {
    setTaskCreationObjectId(objectId);
    setShowCreateTask(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-zinc-800 selection:text-white">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'objects' && (
          <>
            {selectedObjectId ? (
              <ObjectDetailView
                objectId={selectedObjectId}
                onBack={() => setSelectedObjectId(null)}
                onCreateTask={handleCreateTaskForObject}
                onEditObject={(obj) => setEditingObject(obj)}
                onOpenTask={(task) => openTaskModal(task)}
              />
            ) : (
              <ObjectsView
                onSelectObject={(id) => setSelectedObjectId(id)}
                onCreateObject={() => setShowCreateObject(true)}
                onEditObject={(obj) => setEditingObject(obj)}
              />
            )}
          </>
        )}

        {currentTab === 'my-tasks' && (
          <MyTasksView onOpenTask={(task) => openTaskModal(task)} />
        )}

        {currentTab === 'info' && <SystemInfoView />}
      </main>

      {/* Modals */}
      {activeTask && (
        <TaskModal
          task={activeTask}
          onClose={closeTaskModal}
          onEdit={(t) => {
            closeTaskModal();
            setEditingTask(t);
          }}
        />
      )}

      {showCreateObject && (
        <CreateObjectModal
          onClose={() => setShowCreateObject(false)}
          onSuccess={(newId) => {
            setShowCreateObject(false);
            setSelectedObjectId(newId);
          }}
        />
      )}

      {editingObject && (
        <EditObjectModal
          object={editingObject}
          onClose={() => setEditingObject(null)}
          onSuccess={() => {
            setEditingObject(null);
            refresh();
          }}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          initialObjectId={taskCreationObjectId || selectedObjectId}
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => {
            setShowCreateTask(false);
            refresh();
          }}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
