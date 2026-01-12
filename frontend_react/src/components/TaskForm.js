import React, { useMemo, useState } from "react";

// PUBLIC_INTERFACE
export default function TaskForm({ onAddTask, isSubmitting = false }) {
  /** Form for adding a new task. */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // yyyy-mm-dd

  const titleError = useMemo(() => {
    if (!title.trim()) return "Title is required.";
    if (title.trim().length < 2) return "Title must be at least 2 characters.";
    return "";
  }, [title]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (titleError) return;

    const payload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      due_date: dueDate ? dueDate : undefined
    };

    await onAddTask(payload);

    setTitle("");
    setDescription("");
    setDueDate("");
  }

  return (
    <form className="taskForm" onSubmit={handleSubmit} aria-label="Add a new task">
      <div className="taskForm__row">
        <div className="field">
          <label className="field__label" htmlFor="title">Title</label>
          <input
            id="title"
            className="field__input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Buy groceries"
            maxLength={140}
            disabled={isSubmitting}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? "titleError" : undefined}
            required
          />
          {titleError ? <div id="titleError" className="field__error">{titleError}</div> : null}
        </div>

        <div className="field field--date">
          <label className="field__label" htmlFor="dueDate">Due</label>
          <input
            id="dueDate"
            className="field__input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="field__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="taskForm__actions">
        <button className="btn btn--primary" type="submit" disabled={Boolean(titleError) || isSubmitting}>
          {isSubmitting ? "Adding..." : "Add task"}
        </button>
      </div>
    </form>
  );
}
