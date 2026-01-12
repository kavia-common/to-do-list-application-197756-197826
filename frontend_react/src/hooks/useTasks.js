import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createTask,
  deleteTask as deleteTaskApi,
  fetchTasks,
  toggleTaskComplete,
  updateTask
} from "../services/tasksApi";

/**
 * Normalizes backend task shape to a consistent frontend shape.
 * We keep keys close to backend fields.
 */
function normalizeTask(t) {
  return {
    uid: t.uid,
    title: t.title ?? "",
    description: t.description ?? "",
    is_completed: Boolean(t.is_completed),
    due_date: t.due_date ?? null,
    created_date: t.created_date ?? null,
    modified_date: t.modified_date ?? null
  };
}

function sortTasks(a, b) {
  // Incomplete first, then due date asc (nulls last), then uid desc.
  if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;

  const ad = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
  const bd = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
  if (ad !== bd) return ad - bd;

  return String(b.uid).localeCompare(String(a.uid));
}

// PUBLIC_INTERFACE
export function useTasks() {
  /** Hook providing task list state and CRUD actions with optimistic UX. */
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());

  const mountedRef = useRef(true);

  const setBusy = useCallback((id, busy) => {
    setBusyIds(prev => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchTasks();
      const list = Array.isArray(data) ? data : (data?.tasks || []);
      const normalized = list.map(normalizeTask).sort(sortTasks);
      if (mountedRef.current) setTasks(normalized);
    } catch (e) {
      if (mountedRef.current) setErrorMessage(e.message || "Failed to load tasks.");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const sortedTasks = useMemo(() => [...tasks].sort(sortTasks), [tasks]);

  const addTask = useCallback(async (payload) => {
    setErrorMessage("");

    // Optimistic insert with temporary uid.
    const tempUid = `temp_${Date.now()}`;
    const optimistic = {
      uid: tempUid,
      title: payload.title,
      description: payload.description || "",
      due_date: payload.due_date || null,
      is_completed: false,
      created_date: null,
      modified_date: null
    };

    setTasks(prev => [optimistic, ...prev]);

    try {
      const created = await createTask(payload);
      const normalized = normalizeTask(created);

      setTasks(prev => prev.map(t => (t.uid === tempUid ? normalized : t)));
    } catch (e) {
      // Revert optimistic insert
      setTasks(prev => prev.filter(t => t.uid !== tempUid));
      setErrorMessage(e.message || "Failed to create task.");
      throw e;
    }
  }, []);

  const editTask = useCallback(async (id, payload) => {
    setErrorMessage("");
    setBusy(id, true);

    // Optimistic patch
    let snapshot = null;
    setTasks(prev => {
      snapshot = prev.find(t => String(t.uid) === String(id)) || null;
      return prev.map(t => {
        if (String(t.uid) !== String(id)) return t;
        return {
          ...t,
          ...payload,
          // ensure boolean if provided
          ...(typeof payload.is_completed !== "undefined" ? { is_completed: Boolean(payload.is_completed) } : null)
        };
      });
    });

    try {
      const updated = await updateTask(id, payload);
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (String(t.uid) === String(id) ? normalized : t)));
    } catch (e) {
      // revert
      if (snapshot) setTasks(prev => prev.map(t => (String(t.uid) === String(id) ? snapshot : t)));
      setErrorMessage(e.message || "Failed to update task.");
      throw e;
    } finally {
      setBusy(id, false);
    }
  }, [setBusy]);

  const removeTask = useCallback(async (id) => {
    setErrorMessage("");
    setBusy(id, true);

    // Optimistic remove
    let snapshot = null;
    setTasks(prev => {
      snapshot = prev.find(t => String(t.uid) === String(id)) || null;
      return prev.filter(t => String(t.uid) !== String(id));
    });

    try {
      await deleteTaskApi(id);
    } catch (e) {
      // revert
      if (snapshot) setTasks(prev => [snapshot, ...prev]);
      setErrorMessage(e.message || "Failed to delete task.");
      throw e;
    } finally {
      setBusy(id, false);
    }
  }, [setBusy]);

  const toggleComplete = useCallback(async (id) => {
    setErrorMessage("");
    setBusy(id, true);

    // Optimistic toggle
    let snapshot = null;
    setTasks(prev => {
      snapshot = prev.find(t => String(t.uid) === String(id)) || null;
      return prev.map(t => (String(t.uid) === String(id) ? { ...t, is_completed: !t.is_completed } : t));
    });

    try {
      const updated = await toggleTaskComplete(id);
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (String(t.uid) === String(id) ? normalized : t)));
    } catch (e) {
      if (snapshot) setTasks(prev => prev.map(t => (String(t.uid) === String(id) ? snapshot : t)));
      setErrorMessage(e.message || "Failed to toggle completion.");
      throw e;
    } finally {
      setBusy(id, false);
    }
  }, [setBusy]);

  return {
    tasks: sortedTasks,
    isLoading,
    errorMessage,
    busyIds,
    refresh,
    addTask,
    editTask,
    removeTask,
    toggleComplete
  };
}
