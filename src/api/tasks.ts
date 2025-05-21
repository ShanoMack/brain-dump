
import { supabase } from "@/integrations/supabase/client";
import { Task, PlateTask } from "@/types";

export const getTasks = async (listId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("list_id", listId)
    .order("order");
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Ensure correct type casting for status
  return (data || []).map(task => ({
    ...task,
    status: task.status as "todo" | "doing" | "done"
  }));
};

export const createTask = async (task: { title: string; list_id: string; status?: "todo" | "doing" | "done"; order?: number }): Promise<Task> => {
  // Default values for optional properties
  const taskToCreate = {
    ...task,
    status: task.status || "todo",
    order: task.order !== undefined ? task.order : 0
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(taskToCreate)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Ensure correct type casting for status
  return {
    ...data,
    status: data.status as "todo" | "doing" | "done"
  };
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Ensure correct type casting for status
  return {
    ...data,
    status: data.status as "todo" | "doing" | "done"
  };
};

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw new Error(error.message);
  }
};

export const updateTaskStatus = async (
  id: string,
  status: "todo" | "doing" | "done"
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Ensure correct type casting for status
  return {
    ...data,
    status: data.status as "todo" | "doing" | "done"
  };
};

export const reorderTasks = async (
  tasks: { id: string; order: number }[]
): Promise<void> => {
  // Try using a direct update for each task instead of RPC
  try {
    for (const task of tasks) {
      await supabase
        .from("tasks")
        .update({ order: task.order })
        .eq("id", task.id);
    }
  } catch (error) {
    throw new Error("Failed to reorder tasks");
  }
};

export const getUserPlate = async (): Promise<PlateTask[]> => {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error("User must be logged in to view their plate");
  }

  const { data, error } = await supabase
    .rpc('get_user_plate', { user_id: session.user.id });
  
  if (error) {
    // Fallback if RPC function doesn't work
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        todo_lists!inner (
          name
        )
      `)
      .eq("status", "doing");
      
    if (tasksError) {
      throw new Error(tasksError.message);
    }
    
    const processedData = tasksData?.map(task => ({
      ...task,
      status: task.status as "todo" | "doing" | "done",
      list_name: task.todo_lists.name,
      shared_by: null,
      shared_with: null,
      is_shared_ownership: false
    })) || [];
    
    return processedData;
  }
  
  // Ensure correct type casting for status
  return (data || []).map(plate => ({
    ...plate,
    status: plate.status as "todo" | "doing" | "done"
  }));
};
