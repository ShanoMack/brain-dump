
import { supabase } from "@/integrations/supabase/client";
import { TodoList } from "@/types";

export const getLists = async (): Promise<TodoList[]> => {
  const { data, error } = await supabase
    .from("todo_lists")
    .select("*")
    .order("created_at");
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
};

export const createList = async (name: string): Promise<TodoList> => {
  // Get the current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error("User must be logged in to create a list");
  }

  const { data, error } = await supabase
    .from("todo_lists")
    .insert({ 
      name, 
      user_id: session.user.id 
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const updateList = async (id: string, name: string): Promise<TodoList> => {
  const { data, error } = await supabase
    .from("todo_lists")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const deleteList = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("todo_lists")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw new Error(error.message);
  }
};
