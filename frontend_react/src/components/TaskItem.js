import React, { useMemo, useState } from "react";
import { formatDueDate, isOverdue } from "../utils/dates";

// PUBLIC_INTERFACE
export default function TaskItem({
  task,
  isBusy = false,
  onToggleComplete,
  onDelete,
  onSave
}) {
  /** Render a task with inline edit support. */
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editDueDate, setEditDueDate] = useState(task.due_date ? String(task.due_date).slice(0, 10) : "");

  const dueLabel = useMemo(() => formatDueDate(task.due_date), [task.due_date]);
  const overdue = useMemo(() => !task.is_completed && isOverdue(task.due_date), [task.due_date, task.is_completed]);

  function startEdit() {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.due_date ? String(task.due_date).slice(0, 10) : "");
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.due_date ? String(task.due_date).slice(0, 10) : "");
  }

  async function saveEdit() {
    const titleTrimmed = editTitle.trim();
    if (!titleTrimmed) return;

    const payload = {
      title: titleTrimmed,
      description: editDescription.trim() ? editDescription.trim() : "",
      due_date: editDueDate ? editDueDate : null
    };

    await onSave(task.uid, payload);
    setIsEditing(false);
  }

  async function handleDelete() {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;
    await onDelete(task.uid);
  }

  return (
    <li className={`taskItem ${task.is_completed ? "taskItem--done" : ""}`} aria-label={`Task: ${task.title}`}>
      <div className="taskItem__left">
        <button
          className={`check ${task.is_completed ? "check--on" : ""}`}
          type="button"
          onClick={() => onToggleComplete(task.uid)}
          disabled={isBusy}
          aria-pressed={task.is_completed}
          aria-label={task.is_completed ? "Mark as incomplete" : "Mark as complete"}
          title={task.is_completed ? "Completed" : "Incomplete"}
        />
      </div>

      <div className="taskItem__main">
        {!isEditing ? (
          <>
            <div className="taskItem__top">
              <div className="taskItem__titleWrap">
                <div className="taskItem__title">{task.title}</div>
                {dueLabel ? (
                  <span className={`badge ${overdue ? "badge--danger" : "badge--info"}`}>
                    Due {dueLabel}
                  </span>
                ) : (
                  <span className="badge badge--muted">No due date</span>
                )}
              </div>

              <div className="taskItem__actions">
                <button className="btn btn--ghost" type="button" onClick={startEdit} disabled={isBusy}>
                  Edit
                </button>
                <button className="btn btn--danger" type="button" onClick={handleDelete} disabled={isBusy}>
                  Delete
                </button>
              </div>
            </div>

            {task.description ? (
              <div className="taskItem__desc">{task.description}</div>
            ) : (
              <div className="taskItem__desc taskItem__desc--muted">No description</div>
            )}
          </>
        ) : (
          <div className="taskItem__edit">
            <div className="taskItem__editRow">
              <div className="field">
                <label className="field__label" htmlFor={`title_${task.uid}`}>Title</label>
                <input
                  id={`title_${task.uid}`}
                  className="field__input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={140}
                  disabled={isBusy}
                  required
                />
              </div>

              <div className="field field--date">
                <label className="field__label" htmlFor={`due_${task.uid}`}>Due</label>
                <input
                  id={`due_${task.uid}`}
                  className="field__input"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor={`desc_${task.uid}`}>Description</label>
              <textarea
                id={`desc_${task.uid}`}
                className="field__textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                disabled={isBusy}
              />
            </div>

            <div className="taskItem__actions taskItem__actions--edit">
              <button className="btn btn--primary" type="button" onClick={saveEdit} disabled={isBusy || !editTitle.trim()}>
                Save
              </button>
              <button className="btn btn--ghost" type="button" onClick={cancelEdit} disabled={isBusy}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {isBusy ? <div className="taskItem__busy" aria-hidden="true" /> : null}
    </li>
  );
}
