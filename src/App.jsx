import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, BarChart3, Clock, Check, X, Filter, Search, Bell, Target, User, LogOut, UserPlus, Moon, Sun, GripVertical } from 'lucide-react';
ReactDOM.render( <React.StrictMode> <HashRouter> <App /> </HashRouter> </React.StrictMode>, document.getElementById('root') );
const StudyPlanner = () => {
  // Theme Management
  const [darkMode, setDarkMode] = useState(false);

  // User Management
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [loginUsername, setLoginUsername] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Computer Science', color: 'bg-blue-500' },
    { id: 2, name: 'Mathematics', color: 'bg-purple-500' },
    { id: 3, name: 'History', color: 'bg-amber-500' },
    { id: 4, name: 'Physics', color: 'bg-emerald-500' },
    { id: 5, name: 'Literature', color: 'bg-pink-500' },
    { id: 6, name: 'Chemistry', color: 'bg-orange-500' }
  ]);
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review Chapter 5: Data Structures', subject: 'Computer Science', priority: 'high', completed: false, dueDate: '2025-08-21', estimatedTime: 120, order: 0 },
    { id: 2, title: 'Complete Calculus Problem Set 3', subject: 'Mathematics', priority: 'medium', completed: false, dueDate: '2025-08-22', estimatedTime: 90, order: 1 },
    { id: 3, title: 'Read History Assignment - WWII', subject: 'History', priority: 'medium', completed: true, dueDate: '2025-08-20', estimatedTime: 60, order: 2 },
    { id: 4, title: 'Physics Lab Report', subject: 'Physics', priority: 'high', completed: false, dueDate: '2025-08-23', estimatedTime: 180, order: 3 }
  ]);

  // Drag and Drop State
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [newTask, setNewTask] = useState({ 
    title: '', 
    subject: '', 
    priority: 'medium', 
    dueDate: '', 
    estimatedTime: 60 
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [hoveredDate, setHoveredDate] = useState(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  // Subject management
  const [newSubject, setNewSubject] = useState({ name: '', color: 'bg-blue-500' });
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const availableColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 
    'bg-pink-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
    'bg-green-500', 'bg-yellow-500', 'bg-cyan-500', 'bg-rose-500'
  ];

  // Theme Management Functions
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Initialize theme
  useEffect(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = systemPrefersDark;
    
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  // Drag and Drop Functions
  const handleDragStart = (e, task, index) => {
    setDraggedTask({ task, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.index === dropIndex) {
      setDraggedTask(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedTasks = [...filteredTasks];
    const [movedTask] = reorderedTasks.splice(draggedTask.index, 1);
    reorderedTasks.splice(dropIndex, 0, movedTask);

    // Update the order property and task array
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      order: index
    }));

    // Update the main tasks array with new order
    setTasks(prevTasks => {
      const taskMap = new Map(updatedTasks.map(task => [task.id, task]));
      return prevTasks.map(task => taskMap.get(task.id) || task).sort((a, b) => a.order - b.order);
    });

    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  // Simulated Backend Functions
  const saveUserData = (username, userData) => {
    const key = `studyflow_user_${username}`;
    localStorage.setItem(key, JSON.stringify(userData));
  };

  const loadUserData = (username) => {
    const key = `studyflow_user_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };

  const saveUsers = (usersList) => {
    localStorage.setItem('studyflow_users', JSON.stringify(usersList));
  };

  const loadUsers = () => {
    const data = localStorage.getItem('studyflow_users');
    return data ? JSON.parse(data) : [];
  };

  const getCurrentUser = () => {
    return localStorage.getItem('studyflow_current_user');
  };

  const setCurrentUserStorage = (username) => {
    localStorage.setItem('studyflow_current_user', username);
  };

  // Initialize app
  useEffect(() => {
    const savedUsers = loadUsers();
    setUsers(savedUsers);
    
    const savedCurrentUser = getCurrentUser();
    if (savedCurrentUser && savedUsers.includes(savedCurrentUser)) {
      setCurrentUser(savedCurrentUser);
      setShowLogin(false);
      loadUserDataToState(savedCurrentUser);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (currentUser) {
      saveUserData(currentUser, {
        tasks,
        subjects,
        darkMode,
        lastActive: new Date().toISOString()
      });
    }
  }, [currentUser, tasks, subjects, darkMode]);

  const loadUserDataToState = (username) => {
    const userData = loadUserData(username);
    if (userData) {
      setTasks(userData.tasks || []);
      setSubjects(userData.subjects || [
        { id: 1, name: 'Computer Science', color: 'bg-blue-500' },
        { id: 2, name: 'Mathematics', color: 'bg-purple-500' },
        { id: 3, name: 'History', color: 'bg-amber-500' },
        { id: 4, name: 'Physics', color: 'bg-emerald-500' }
      ]);
      
      // Load theme preference
      if (userData.darkMode !== undefined) {
        setDarkMode(userData.darkMode);
        document.documentElement.classList.toggle('dark', userData.darkMode);
      }
    }
  };

  const createUser = () => {
    if (newUsername.trim() && !users.includes(newUsername.trim())) {
      const username = newUsername.trim();
      const updatedUsers = [...users, username];
      
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      
      // Initialize with default data
      saveUserData(username, {
        tasks: [],
        subjects: [
          { id: 1, name: 'Computer Science', color: 'bg-blue-500' },
          { id: 2, name: 'Mathematics', color: 'bg-purple-500' },
          { id: 3, name: 'History', color: 'bg-amber-500' },
          { id: 4, name: 'Physics', color: 'bg-emerald-500' }
        ],
        darkMode: false,
        lastActive: new Date().toISOString()
      });
      
      loginUser(username);
      setNewUsername('');
    }
  };

  const loginUser = (username) => {
    setCurrentUser(username);
    setCurrentUserStorage(username);
    setShowLogin(false);
    loadUserDataToState(username);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('studyflow_current_user');
    setShowLogin(true);
    setTasks([]);
    setSubjects([]);
  };

  const switchUser = (username) => {
    if (username !== currentUser) {
      loginUser(username);
    }
  };
  
  const priorityColors = {
    low: darkMode ? 'bg-green-900 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-200',
    medium: darkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: darkMode ? 'bg-red-900 text-red-300 border-red-800' : 'bg-red-50 text-red-700 border-red-200'
  };

  const getSubjectColor = (subjectName) => {
    const subject = subjects.find(s => s.name === subjectName);
    return subject ? subject.color : 'bg-gray-500';
  };

  // Subject management functions
  const addSubject = () => {
    if (newSubject.name.trim() && !subjects.find(s => s.name === newSubject.name)) {
      setSubjects(prev => [...prev, {
        id: Date.now(),
        name: newSubject.name.trim(),
        color: newSubject.color
      }]);
      setNewSubject({ name: '', color: 'bg-blue-500' });
      setShowAddSubject(false);
    }
  };

  const updateSubject = (id, updatedSubject) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === id ? { ...subject, ...updatedSubject } : subject
    ));
    
    // Update tasks that use this subject
    const oldSubject = subjects.find(s => s.id === id);
    if (oldSubject && updatedSubject.name !== oldSubject.name) {
      setTasks(prev => prev.map(task => 
        task.subject === oldSubject.name ? { ...task, subject: updatedSubject.name } : task
      ));
    }
    setEditingSubject(null);
  };

  const deleteSubject = (id) => {
    const subjectToDelete = subjects.find(s => s.id === id);
    if (subjectToDelete) {
      // Remove subject
      setSubjects(prev => prev.filter(s => s.id !== id));
      
      // Update tasks that used this subject to have no subject
      setTasks(prev => prev.map(task => 
        task.subject === subjectToDelete.name ? { ...task, subject: '' } : task
      ));
      
      // Reset filters if they were using this subject
      if (filterSubject === subjectToDelete.name) {
        setFilterSubject('all');
      }
    }
  };

  const completeTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : -1;
      setTasks(prev => [...prev, {
        id: Date.now(),
        ...newTask,
        completed: false,
        order: maxOrder + 1
      }]);
      setNewTask({ title: '', subject: '', priority: 'medium', dueDate: '', estimatedTime: 60 });
      setShowAddTask(false);
    }
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || task.subject === filterSubject;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesSubject && matchesPriority;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  const getUpcomingTasks = () => {
    const upcoming = tasks.filter(task => !task.completed && task.dueDate);
    return upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
    const totalStudyTime = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimatedTime, 0);
    
    return { total, completed, overdue, totalStudyTime, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const stats = getStats();

  // Calendar utilities
  const getTasksForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateString);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date, referenceDate) => {
    return date.getMonth() === referenceDate.getMonth() && 
           date.getFullYear() === referenceDate.getFullYear();
  };

  const navigateCalendar = (direction) => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Login Screen */}
      {showLogin && (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}>
          <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            {/* Theme Toggle in Login */}
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <div className="text-center mb-8">
              <BookOpen className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>StudyFlow</h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your personal study companion</p>
            </div>

            {/* Existing Users */}
            {users.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Choose Your Account</h3>
                <div className="space-y-2">
                  {users.map(user => (
                    <button
                      key={user}
                      onClick={() => loginUser(user)}
                      className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-400' 
                          : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          darkMode ? 'bg-blue-500' : 'bg-blue-600'
                        }`}>
                          <span className="text-white font-semibold text-sm">
                            {user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user}</span>
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click to login</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New User */}
            <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : ''}`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Account</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createUser()}
                  className={`w-full px-4 py-3 border rounded-lg text-lg transition-colors duration-300 ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button
                  onClick={createUser}
                  disabled={!newUsername.trim() || users.includes(newUsername.trim())}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-lg transition-colors duration-300 flex items-center justify-center ${
                    darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="mr-2" size={20} />
                  Create Account
                </button>
              </div>
              {newUsername.trim() && users.includes(newUsername.trim()) && (
                <p className="text-red-500 text-sm mt-2">This username already exists</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main App */}
      {!showLogin && currentUser && (
        <>
          {/* Header */}
          <header className={`shadow-sm border-b transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <BookOpen className={`h-8 w-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>StudyFlow</h1>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  
                  <Bell className={`h-6 w-6 cursor-pointer transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`} />
                  
                  {/* User Dropdown */}
                  <div className="relative group">
                    <button className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-300 ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-blue-500' : 'bg-blue-600'
                      }`}>
                        <span className="text-white font-semibold text-sm">
                          {currentUser.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-64 border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Switch Account</p>
                      </div>
                      <div className="py-2">
                        {users.filter(user => user !== currentUser).map(user => (
                          <button
                            key={user}
                            onClick={() => switchUser(user)}
                            className={`w-full flex items-center px-4 py-2 text-left transition-colors duration-300 ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                              darkMode ? 'bg-gray-600' : 'bg-gray-500'
                            }`}>
                              <span className="text-white font-semibold text-xs">
                                {user.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className={darkMode ? 'text-white' : 'text-gray-900'}>{user}</span>
                          </button>
                        ))}
                        <div className={`border-t mt-2 pt-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <button
                            onClick={logoutUser}
                            className={`w-full flex items-center px-4 py-2 text-left transition-colors duration-300 text-red-600 ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                            }`}
                          >
                            <LogOut className="mr-3" size={16} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

      
        {/* Navigation */}
              <nav className={`shadow-sm border-b transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex space-x-8">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                      { id: 'tasks', label: 'Tasks', icon: BookOpen },
                      { id: 'subjects', label: 'Subjects', icon: BookOpen },
                      { id: 'calendar', label: 'Calendar', icon: Calendar },
                      { id: 'analytics', label: 'Analytics', icon: Target }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-3 py-4 border-b-2 font-medium text-sm transition-colors duration-300 ${
                          activeTab === tab.id
                            ? darkMode
                              ? 'border-blue-400 text-blue-400'
                              : 'border-blue-500 text-blue-600'
                            : darkMode
                            ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="mr-2" size={18} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>

                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* User Info Banner */}
            <div className={`rounded-lg shadow p-6 text-white transition-colors duration-300 ${
              darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {currentUser}!</h2>
                  <p className={`mt-1 ${darkMode ? 'text-blue-100' : 'text-blue-100'}`}>Your study data is automatically saved and synced</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{users.length}</div>
                  <div className={`text-sm ${darkMode ? 'text-blue-100' : 'text-blue-100'}`}>Total Users</div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    <BookOpen className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                    <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                    <Check className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                    <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                    <Clock className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Study Hours</p>
                    <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(stats.totalStudyTime / 60)}h</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                    <Target className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</p>
                    <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Tasks */}
              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Upcoming Deadlines</h3>
                <div className="space-y-3">
                  {getUpcomingTasks().map(task => (
                    <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${getSubjectColor(task.subject)}`}></div>
                        <div>
                          <p className={`font-medium text-sm transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{task.title}</p>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{task.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{task.dueDate}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Progress */}
              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Subject Progress</h3>
                <div className="space-y-4">
                  {subjects.slice(0, 4).map(subject => {
                    const subjectTasks = tasks.filter(t => t.subject === subject.name);
                    const completed = subjectTasks.filter(t => t.completed).length;
                    const total = subjectTasks.length;
                    const percentage = total > 0 ? (completed / total) * 100 : 0;
                    
                    return (
                      <div key={subject.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>{subject.name}</span>
                          <span className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{completed}/{total}</span>
                        </div>
                        <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div 
                            className={`h-2 rounded-full ${subject.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Study Tasks</h2>
                <button
                  onClick={() => setShowAddTask(true)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Plus className="mr-2" size={16} />
                  Add Task
                </button>
              </div>

              {/* Filters */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2`}
                  />
                </div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Add New Task</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                    className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2`}
                  />
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Estimated Time (minutes)</label>
                    <input
                      type="number"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({...newTask, estimatedTime: parseInt(e.target.value) || 60})}
                      className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={addTask}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Task List */}
            <div className={`rounded-lg shadow transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Drag and drop to reorder tasks
                </p>
              </div>
              <div className={`divide-y transition-colors duration-300 ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-6 transition-all duration-300 cursor-move ${
                      task.completed ? 'opacity-60' : ''
                    } ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${
                      dragOverIndex === index
                        ? darkMode
                          ? 'bg-gray-700 border-l-4 border-blue-400'
                          : 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    } ${
                      draggedTask?.index === index
                        ? 'opacity-50 scale-95'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Drag Handle */}
                        <div className={`cursor-grab active:cursor-grabbing transition-colors duration-300 ${
                          darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                        }`}>
                          <GripVertical size={18} />
                        </div>
                        
                        <button
                          onClick={() => completeTask(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-300 ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : darkMode
                              ? 'border-gray-600 hover:border-green-400'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {task.completed && <Check size={14} />}
                        </button>
                        <div className={`w-3 h-3 rounded-full ${getSubjectColor(task.subject)}`}></div>
                        <div>
                          <h4 className={`font-medium transition-colors duration-300 ${
                            task.completed 
                              ? darkMode ? 'line-through text-gray-500' : 'line-through text-gray-500'
                              : darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`text-sm transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{task.subject}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className={`text-sm flex items-center transition-colors duration-300 ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <Calendar size={14} className="mr-1" />
                                {task.dueDate}
                              </span>
                            )}
                            <span className={`text-sm flex items-center transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Clock size={14} className="mr-1" />
                              {task.estimatedTime}min
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className={`transition-colors duration-300 ${
                          darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <div className={`p-12 text-center transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No tasks found</p>
                    <p className="text-sm">Try adjusting your filters or add a new task</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            {/* Header */}
            <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Manage Subjects</h2>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Add, edit, or remove your study subjects and courses</p>
                </div>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Plus className="mr-2" size={16} />
                  Add Subject
                </button>
              </div>
            </div>

            {/* Add Subject Form */}
            {showAddSubject && (
              <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Add New Subject</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Advanced Calculus"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                      className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Color</label>
                    <div className="flex space-x-2">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewSubject({...newSubject, color})}
                          className={`w-8 h-8 rounded-full ${color} border-2 ${
                            newSubject.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={addSubject}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-300 ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Add Subject
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSubject(false);
                      setNewSubject({ name: '', color: 'bg-blue-500' });
                    }}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Subjects List */}
            <div className={`rounded-lg shadow transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Your Subjects ({subjects.length})
                </h3>
              </div>
              <div className={`divide-y transition-colors duration-300 ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {subjects.map(subject => (
                  <div key={subject.id} className={`p-6 transition-colors duration-300 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    {editingSubject === subject.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => setSubjects(prev => prev.map(s => 
                              s.id === subject.id ? {...s, name: e.target.value} : s
                            ))}
                            className={`w-full border rounded-md py-2 px-3 text-sm transition-colors duration-300 ${
                              darkMode 
                                ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400 focus:border-blue-400' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } focus:outline-none focus:ring-2`}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          {availableColors.map(color => (
                            <button
                              key={color}
                              onClick={() => setSubjects(prev => prev.map(s => 
                                s.id === subject.id ? {...s, color} : s
                              ))}
                              className={`w-6 h-6 rounded-full ${color} border ${
                                subject.color === color ? 'border-gray-800 border-2' : 'border-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="sm:col-span-2 flex space-x-2">
                          <button
                            onClick={() => updateSubject(subject.id, subject)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSubject(null)}
                            className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded transition-colors duration-300 ${
                              darkMode 
                                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
                          <div>
                            <h4 className={`font-medium transition-colors duration-300 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>{subject.name}</h4>
                            <p className={`text-sm transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {tasks.filter(t => t.subject === subject.name).length} tasks
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingSubject(subject.id)}
                            className={`text-sm font-medium transition-colors duration-300 ${
                              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className={`text-sm font-medium transition-colors duration-300 ${
                              darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {subjects.length === 0 && (
                  <div className={`p-6 text-center transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No subjects added yet</p>
                    <p className="text-sm">Add your first subject to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Study Calendar</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateCalendar(-1)}
                    className={`px-3 py-2 rounded-md font-semibold transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    ← Prev
                  </button>
                  <span className={`text-lg font-medium min-w-[200px] text-center transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => navigateCalendar(1)}
                    className={`px-3 py-2 rounded-md font-semibold transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className={`p-3 text-center font-semibold text-sm rounded-md transition-colors duration-300 ${
                    darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'
                  }`}>
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentCalendarDate).map((date, index) => {
                  const tasksForDate = getTasksForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentCalendarDate);
                  const isTodayDate = isToday(date);
                  
                  return (
                    <div
                      key={index}
                      className={`relative p-2 h-28 border rounded-md transition-all cursor-pointer ${
                        isTodayDate 
                          ? darkMode 
                            ? 'bg-blue-900 border-blue-400 border-2' 
                            : 'bg-blue-100 border-blue-400 border-2'
                          : darkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } ${
                        !isCurrentMonth 
                          ? darkMode 
                            ? 'text-gray-500 bg-gray-800 opacity-60' 
                            : 'text-gray-300 bg-gray-50 opacity-60'
                          : darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      onMouseEnter={() => {
                        if (tasksForDate.length > 0) {
                          setHoveredDate({ date, tasks: tasksForDate });
                        }
                      }}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      <div className={`font-semibold text-sm mb-2 ${
                        isTodayDate 
                          ? darkMode ? 'text-blue-300' : 'text-blue-700'
                          : ''
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {/* Task indicators */}
                      {tasksForDate.length > 0 && (
                        <div className="space-y-1">
                          {tasksForDate.slice(0, 2).map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className={`text-xs px-1 py-0.5 rounded text-white truncate ${getSubjectColor(task.subject)} ${
                                task.completed ? 'opacity-60 line-through' : ''
                              }`}
                              title={task.title}
                            >
                              {task.title.substring(0, 12)}...
                            </div>
                          ))}
                          {tasksForDate.length > 2 && (
                            <div className={`text-xs text-center font-medium transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              +{tasksForDate.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Today's Tasks</h3>
              {(() => {
                const today = new Date();
                const todayTasks = getTasksForDate(today);
                
                if (todayTasks.length === 0) {
                  return (
                    <div className={`text-center py-8 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No tasks scheduled for today</p>
                      <p className="text-sm">Great! You can focus on other activities.</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {todayTasks.map(task => (
                      <div key={task.id} className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                        task.completed 
                          ? darkMode 
                            ? 'bg-green-900 border-green-600' 
                            : 'bg-green-50 border-green-200'
                          : darkMode 
                          ? 'bg-gray-700 border-gray-600 hover:border-blue-400' 
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => completeTask(task.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              task.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : darkMode 
                                ? 'border-gray-500 hover:border-green-400' 
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {task.completed && <Check size={14} />}
                          </button>
                          <div className={`w-4 h-4 rounded-full ${getSubjectColor(task.subject)}`}></div>
                          <div>
                            <h4 className={`font-medium ${
                              task.completed 
                                ? darkMode ? 'line-through text-gray-500' : 'line-through text-gray-500'
                                : darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h4>
                            <div className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <span>{task.subject}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs transition-colors duration-300 ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              <span>•</span>
                              <span>{task.estimatedTime} minutes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* This Week Overview */}
            <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>This Week's Overview</h3>
              {(() => {
                const today = new Date();
                const weekDays = [];
                
                for (let i = 0; i < 7; i++) {
                  const date = new Date(today);
                  date.setDate(today.getDate() + i);
                  const dayTasks = getTasksForDate(date);
                  
                  weekDays.push({
                    date,
                    tasks: dayTasks,
                    isToday: i === 0
                  });
                }
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weekDays.map((day, index) => (
                      <div key={index} className={`border-2 rounded-lg p-3 transition-colors duration-300 ${
                        day.isToday 
                          ? darkMode 
                            ? 'border-blue-400 bg-blue-900' 
                            : 'border-blue-400 bg-blue-50'
                          : darkMode 
                          ? 'border-gray-600 bg-gray-700' 
                          : 'border-gray-200 bg-white'
                      }`}>
                        <h4 className={`font-semibold text-sm mb-2 transition-colors duration-300 ${
                          day.isToday 
                            ? darkMode ? 'text-blue-300' : 'text-blue-700'
                            : darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {day.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                          {day.isToday && <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>(Today)</div>}
                        </h4>
                        {day.tasks.length === 0 ? (
                          <div className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>No tasks</div>
                        ) : (
                          <div className="space-y-1">
                            {day.tasks.slice(0, 2).map(task => (
                              <div key={task.id} className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getSubjectColor(task.subject)}`}></div>
                                <span className={`text-xs truncate ${
                                  task.completed 
                                    ? darkMode ? 'line-through text-gray-500' : 'line-through text-gray-500'
                                    : darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {task.title.substring(0, 15)}...
                                </span>
                              </div>
                            ))}
                            {day.tasks.length > 2 && (
                              <div className={`text-xs transition-colors duration-300 ${
                                darkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>+{day.tasks.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Hover Tooltip */}
        {hoveredDate && (
          <div 
            className="fixed z-50 pointer-events-none bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-w-sm"
            style={{
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">
              {formatDate(hoveredDate.date)}
            </h4>
            <div className="space-y-3">
              {hoveredDate.tasks.map((task, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getSubjectColor(task.subject)}`}></div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>{task.subject}</span>
                      <span className="mx-1">•</span>
                      <span className="capitalize">{task.priority} priority</span>
                      <span className="mx-1">•</span>
                      <span>{task.estimatedTime} min</span>
                    </div>
                  </div>
                  {task.completed && (
                    <Check size={14} className="text-green-500 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                        <span className="text-sm font-medium">{stats.completed}/{stats.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${stats.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{Math.round(stats.totalStudyTime / 60)}</p>
                        <p className="text-sm text-gray-600">Hours Studied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Distribution</h3>
                  <div className="space-y-3">
                    {subjects.map(subject => {
                      const subjectTasks = tasks.filter(t => t.subject === subject.name);
                      const percentage = stats.total > 0 ? (subjectTasks.length / stats.total) * 100 : 0;
                      
                      return (
                        <div key={subject.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${subject.color}`}></div>
                            <span className="text-sm text-gray-700">{subject.name}</span>
                          </div>
                          <span className="text-sm font-medium">{subjectTasks.length} ({Math.round(percentage)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default StudyPlanner;