// Client-side storage management with localStorage and auto-save
export class StorageManager {
  constructor() {
    this.prefix = 'doctoral_dashboard_';
  }

  // Get data from localStorage
  get(key) {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  // Set data in localStorage
  set(key, value) {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      this.updateActivity(key);
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      return false;
    }
  }

  // Remove data from localStorage
  remove(key) {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  // Get all keys
  getAllKeys() {
    if (typeof window === 'undefined') return [];
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  // Update activity log
  updateActivity(key) {
    const activity = this.get('activity_log') || [];
    activity.unshift({
      key,
      timestamp: new Date().toISOString(),
      action: 'updated'
    });
    // Keep last 50 activities
    if (activity.length > 50) activity.pop();
    localStorage.setItem(this.prefix + 'activity_log', JSON.stringify(activity));
  }

  // Initialize default data structure
  initializeDefaults() {
    const defaults = {
      user: {
        username: 'admin',
        passwordHash: '$2a$10$rQ8YZqZ5Q5Q5Q5Q5Q5Q5QuXZqZ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qe', // 'doctoral2026'
        role: 'admin'
      },
      dashboard: {
        progress: {
          pop: 0,
          literatureReview: 0,
          methods: 0,
          dataCollection: 0,
          analysis: 0,
          writing: 0
        },
        nextActions: []
      },
      sections: {
        pop: { title: 'Problem of Practice', content: '', lastEdited: null },
        literatureReview: { title: 'Literature Review', buckets: [], content: '', lastEdited: null },
        conceptualFramework: { title: 'Conceptual Framework', content: '', lastEdited: null },
        methods: { title: 'Methods', content: '', lastEdited: null },
        data: { title: 'Data & Evidence', items: [], lastEdited: null },
        stakeholders: { title: 'Stakeholders', content: '', lastEdited: null },
        writing: { title: 'Writing Studio', chapters: [], lastEdited: null },
        timeline: { title: 'Timeline & Milestones', milestones: [], lastEdited: null },
        tasks: { title: 'Tasks', columns: { todo: [], inProgress: [], done: [] }, lastEdited: null },
        meetings: { title: 'Meetings & Notes', entries: [], lastEdited: null },
        bibliography: { title: 'Bibliography', content: 'Your completed bibliography with Macro, Mega, and Micro lenses will be displayed here.', locked: true, lastEdited: null }
      }
    };

    // Only initialize if not already set
    if (!this.get('user')) {
      this.set('user', defaults.user);
    }
    if (!this.get('dashboard')) {
      this.set('dashboard', defaults.dashboard);
    }
    if (!this.get('sections')) {
      this.set('sections', defaults.sections);
    }
  }

  // Export all data
  exportAll() {
    const data = {};
    const keys = this.getAllKeys();
    keys.forEach(key => {
      data[key] = this.get(key);
    });
    return data;
  }

  // Import data
  importAll(data) {
    Object.keys(data).forEach(key => {
      this.set(key, data[key]);
    });
  }
}

export const storage = new StorageManager();
