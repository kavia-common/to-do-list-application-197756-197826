import React from "react";
import TaskItem from "./TaskItem";

// PUBLIC_INTERFACE
export default function TaskList({
  tasks,
  busyIds,
  onToggleComplete,
  onDelete,
  onSave
}) {
  /** Render list of tasks. */
  if (!tasks.length) {
    return (
      <div className="empty">
        <div className="empty__title">No tasks yet</div>
        <div className="empty__text">Add your first task above to get started.</div>
      </div>
    );
  }

  return (
    <ul className="taskList" aria-label="Tasks list">
      {tasks.map((t) => (
        <TaskItem
          key={t.uid}
          task={t}
          isBusy={busyIds.has(t.uid)}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onSave={onSave}
        />
      ))}
    </ul>
  );
}
