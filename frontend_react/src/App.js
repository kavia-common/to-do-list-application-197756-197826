import React, { useMemo, useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";

function countStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.is_completed).length;
  return { total, done, open: total - done };
}

// PUBLIC_INTERFACE
function App() {
  /** Main task manager app (CRUD + completion toggle) consuming the Express backend API. */
  const {
    tasks,
    isLoading,
    errorMessage,
    busyIds,
    refresh,
    addTask,
    editTask,
    removeTask,
    toggleComplete
  } = useTasks();

  const [isAdding, setIsAdding] = useState(false);

  const stats = useMemo(() => countStats(tasks), [tasks]);

  async function handleAddTask(payload) {
    setIsAdding(true);
    try {
      await addTask(payload);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="App">
      <div className="page">
        <header className="topbar">
          <div className="topbar__brand">
            <div className="logoMark" aria-hidden="true">✓</div>
            <div className="topbar__titles">
              <h1 className="h1">Tasks</h1>
              <p className="subtle">
                {stats.open} open · {stats.done} done · {stats.total} total
              </p>
            </div>
          </div>

          <div className="topbar__actions">
            <button className="btn btn--ghost" type="button" onClick={refresh} disabled={isLoading}>
              Refresh
            </button>
          </div>
        </header>

        <main className="content">
          <section className="card">
            <div className="card__header">
              <h2 className="h2">Add task</h2>
              <p className="subtle">Create a task with an optional description and due date.</p>
            </div>
            <div className="card__body">
              <TaskForm onAddTask={handleAddTask} isSubmitting={isAdding} />
            </div>
          </section>

          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2 className="h2">Your list</h2>
                <p className="subtle">Toggle completion, edit details, or delete tasks.</p>
              </div>

              {isLoading ? (
                <span className="pill pill--loading" aria-label="Loading tasks">Loading…</span>
              ) : (
                <span className="pill pill--ready" aria-label="Tasks loaded">Up to date</span>
              )}
            </div>

            <div className="card__body">
              {errorMessage ? (
                <div className="alert" role="alert">
                  <div className="alert__title">Something went wrong</div>
                  <div className="alert__text">{errorMessage}</div>
                  <div className="alert__actions">
                    <button className="btn btn--primary" type="button" onClick={refresh}>
                      Retry
                    </button>
                  </div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="skeleton" aria-label="Loading placeholder">
                  <div className="skeleton__line" />
                  <div className="skeleton__line" />
                  <div className="skeleton__line" />
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  busyIds={busyIds}
                  onToggleComplete={toggleComplete}
                  onDelete={removeTask}
                  onSave={editTask}
                />
              )}
            </div>
          </section>

          <footer className="footer">
            <div className="subtle">
              API: <code>{process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"}</code>
            </div>
            <div className="subtle">
              Tip: set <code>REACT_APP_API_BASE_URL</code> to point to a deployed backend.
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
