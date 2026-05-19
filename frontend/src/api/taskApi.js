import api from './axios';

export const getTasks    = (projectId) => api.get('/tasks', { params: { project: projectId } });
export const getTask     = (id)        => api.get(`/tasks/${id}`);
export const createTask  = (data)      => api.post('/tasks', data);
export const updateTask  = (id, data)  => api.put(`/tasks/${id}`, data);
export const deleteTask  = (id)        => api.delete(`/tasks/${id}`);
