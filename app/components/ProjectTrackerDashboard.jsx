'use client';

import React, { useState, useMemo } from 'react';
import { Upload, FileSpreadsheet, Calendar, AlertCircle, CheckCircle, Clock, BarChart3, PieChart } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProjectTrackerDashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        console.log('Loaded projects:', data);
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
        }
      } catch (error) {
        alert('Error reading file. Please ensure it is a valid Excel file.');
        console.error(error);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    const project = projects.find(p => p['Project Name'] === projectName);
    setSelectedProject(project);
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    const p = priority.toString().toLowerCase();
    if (p.includes('p0') || p.includes('high') || p.includes('critical')) return 'bg-red-100 text-red-800';
    if (p.includes('p1') || p.includes('medium')) return 'bg-yellow-100 text-yellow-800';
    if (p.includes('p2') || p.includes('low')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStageColor = (stage) => {
    if (!stage) return 'bg-gray-200';
    const s = stage.toString().toLowerCase();
    if (s.includes('complete') || s.includes('done')) return 'bg-green-500';
    if (s.includes('progress') || s.includes('development') || s.includes('pending')) return 'bg-blue-500';
    if (s.includes('signoff') || s.includes('user')) return 'bg-yellow-500';
    if (s.includes('blocked')) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    
    // If it's a number (Excel date serial number)
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    
    return value.toString();
  };

  // Chart data calculations
  const chartData = useMemo(() => {
    if (projects.length === 0) return null;

    // Priority distribution
    const priorityCount = {};
    projects.forEach(p => {
      const priority = p['Priority'] || 'Unknown';
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });
    const priorityData = Object.keys(priorityCount).map(key => ({
      name: key,
      value: priorityCount[key]
    }));

    // Stage distribution
    const stageCount = {};
    projects.forEach(p => {
      const stage = p['Current Stage'] || 'Unknown';
      stageCount[stage] = (stageCount[stage] || 0) + 1;
    });
    const stageData = Object.keys(stageCount).map(key => ({
      name: key,
      count: stageCount[key]
    }));

    // Size distribution
    const sizeCount = {};
    projects.forEach(p => {
      const size = p['Size'] || 'Unknown';
      sizeCount[size] = (sizeCount[size] || 0) + 1;
    });
    const sizeData = Object.keys(sizeCount).map(key => ({
      name: key,
      value: sizeCount[key]
    }));

    // Ageing analysis
    const ageingData = projects.map(p => ({
      name: p['Project Name']?.substring(0, 15) + '...' || 'Unknown',
      ageing: parseInt(p['Ageing 1']) || 0
    })).sort((a, b) => b.ageing - a.ageing).slice(0, 10);

    return { priorityData, stageData, sizeData, ageingData };
  }, [projects]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const InfoCard = ({ label, value, icon: Icon, colorClass = 'bg-white', isDate = false }) => (
    <div className={`${colorClass} rounded-lg p-4 shadow-sm border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-base font-semibold text-gray-900 break-words">
            {isDate ? formatDate(value) : (value || 'N/A')}
          </p>
        </div>
        {Icon && (
          <div className="ml-3">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Tracker Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your project portfolio</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileSpreadsheet className="w-6 h-6 mr-2 text-indigo-600" />
              Upload Project Data
            </h2>
            {fileName && (
              <span className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                ✓ {fileName}
              </span>
            )}
          </div>
          
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">Excel files (.xlsx, .xls)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project ({projects.length} projects loaded)
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
              onChange={handleProjectChange}
              value={selectedProject?.['Project Name'] || ''}
            >
              {projects.map((project, idx) => (
                <option key={idx} value={project['Project Name']}>
                  {project['Project Name']}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Project Details */}
        {selectedProject && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                {selectedProject['Project Name']}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={`rounded-lg p-4 shadow-sm ${getPriorityColor(selectedProject['Priority'])}`}>
                  <p className="text-sm font-medium mb-1">Priority</p>
                  <p className="text-lg font-bold">{selectedProject['Priority'] || 'N/A'}</p>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium mb-1 opacity-90">Size</p>
                  <p className="text-lg font-bold">{selectedProject['Size'] || 'N/A'}</p>
                </div>
                
                <div className={`rounded-lg p-4 shadow-sm text-white ${getStageColor(selectedProject['Current Stage'])}`}>
                  <p className="text-sm font-medium mb-1 opacity-90">Current Stage</p>
                  <p className="text-lg font-bold">{selectedProject['Current Stage'] || 'N/A'}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium mb-1 opacity-90">Ageing</p>
                  <p className="text-lg font-bold">{selectedProject['Ageing 1'] || 'N/A'} days</p>
                </div>
              </div>

              {/* Status Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <InfoCard 
                  label="Current Remark" 
                  value={selectedProject['Current Remark']}
                  icon={AlertCircle}
                  colorClass="bg-blue-50"
                />
                <InfoCard 
                  label="Pending With" 
                  value={selectedProject['Pending with'] || selectedProject['Pending With']}
                  icon={Clock}
                  colorClass="bg-yellow-50"
                />
              </div>

              {/* Timeline Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Timeline & Dates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard 
                    label="Current Stage Pending Since" 
                    value={selectedProject['Current stage pending since']}
                    isDate={true}
                  />
                  <InfoCard 
                    label="Last Action Date" 
                    value={selectedProject['Last Action date']}
                    isDate={true}
                  />

                    {/* Next Action Date as per plan
 */}

                  <InfoCard 
                    label="Next Action (As Per Plan)" 
                    value={selectedProject['Next Action Date as per plan'] || selectedProject['Next Action Date as per plan']}
                    isDate={true}
                  />
                  <InfoCard 
                    label="Next Action Date" 
                    value={selectedProject['Next Action Date'] || selectedProject['Next action data']}
                    isDate={true}
                  />
                  <InfoCard 
                    label="BRD Shared Date" 
                    value={selectedProject['BRD Shared date'] || selectedProject['BRD Shared date']}
                    isDate={true}
                  />
                  <InfoCard 
                    label="Today" 
                    value={selectedProject['Today']}
                    isDate={true}
                  />
                </div>
              </div>

              {/* Project Plan Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Project Planning Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`rounded-lg p-4 shadow-sm ${
                    selectedProject['Plan shared Y/N']?.toString().toLowerCase().includes('y') ||
                    selectedProject['Project plan shared (Yes/No)']?.toString().toLowerCase().includes('yes')
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm font-medium mb-1">Project Plan Shared</p>
                    <p className="text-lg font-bold">
                      {selectedProject['Plan shared Y/N'] || selectedProject['Project plan shared (Yes/No)'] || 'N/A'}
                    </p>
                  </div>

                  {/* Plan confirmation received Y/N */}
                  <div className={`rounded-lg p-4 shadow-sm ${
                    selectedProject['Plan confirmation received Y/N']?.toString().toLowerCase().includes('y') ||
                    selectedProject['Plan confirmation recieved (Yes / No)']?.toString().toLowerCase().includes('yes')
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm font-medium mb-1">Plan Confirmation Received</p>
                    <p className="text-lg font-bold">
                      {selectedProject['Plan confirmation received Y/N'] || selectedProject['Plan confirmation recieved (Yes / No)'] || 'N/A'}
                    </p>
                  </div>
                  
                  <InfoCard 
                    label="Ageing (Days)" 
                    value={selectedProject['Ageing 2'] || selectedProject['Ageing 2']}
                  />
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-2">Remarks</p>
                  <p className="text-gray-900">{selectedProject['Remarks'] || selectedProject['Remark'] || 'No remarks'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Loaded</h3>
            <p className="text-gray-600">Upload an Excel file to get started with your project tracking</p>
          </div>
        )}

        {/* Charts Section */}
        {projects.length > 0 && chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Priority Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
                Priority Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={chartData.priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Current Stage Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Size Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                Project Size Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={chartData.sizeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.sizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 Projects by Ageing */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                Top 10 Projects by Ageing
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.ageingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="ageing" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}