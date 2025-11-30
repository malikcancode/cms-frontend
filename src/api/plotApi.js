import api from "./config";

/**
 * Get all plots
 */
export const getAllPlots = async () => {
  const response = await api.get("/plots");
  return response.data;
};

/**
 * Get plot by ID
 */
export const getPlotById = async (id) => {
  const response = await api.get(`/plots/${id}`);
  return response.data;
};

/**
 * Create new plot
 */
export const createPlot = async (plotData) => {
  const response = await api.post("/plots", plotData);
  return response.data;
};

/**
 * Update existing plot
 */
export const updatePlot = async (id, plotData) => {
  const response = await api.put(`/plots/${id}`, plotData);
  return response.data;
};

/**
 * Delete plot (soft delete)
 */
export const deletePlot = async (id) => {
  const response = await api.delete(`/plots/${id}`);
  return response.data;
};

/**
 * Get plots by project
 */
export const getPlotsByProject = async (projectId) => {
  const response = await api.get(`/plots/project/${projectId}`);
  return response.data;
};

/**
 * Get plot summary statistics
 */
export const getPlotSummary = async () => {
  const response = await api.get("/plots/summary");
  return response.data;
};
