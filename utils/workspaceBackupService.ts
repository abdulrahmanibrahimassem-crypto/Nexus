import { haptic } from './hapticService';

export interface WorkspaceBackupPayload {
  version: string;
  exportedAt: string;
  appId: string;
  userId: string;
  data: {
    courses: any[];
    documents: any[];
    tasks: any[];
    events: any[];
    flashcards: any[];
    quizzes: any[];
    journalEntries: any[];
    dailyGoals: string[];
    theme?: string;
    strategies?: any;
    techniques?: any;
    focusHistory?: any[];
    customTracks?: any[];
  };
}

/**
 * Exports all user workspace state from localStorage as a portable JSON backup file.
 */
export function exportWorkspaceBackup(userId: string = 'guest'): void {
  try {
    const getItem = (key: string) => {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
      } catch {
        return null;
      }
    };

    const courses = getItem(`soft_study_user_courses_${userId}`) || [];
    const documents = getItem(`soft_study_user_documents_${userId}`) || [];
    const tasks = getItem(`study_nexus_tasks_${userId}`) || [];
    const events = getItem(`study_nexus_events_${userId}`) || [];
    const flashcards = getItem(`study_nexus_flashcards_${userId}`) || [];
    const quizzes = getItem(`study_nexus_quizzes_${userId}`) || [];
    const strategies = getItem(`study_nexus_strategies_${userId}`) || {};
    const techniques = getItem(`study_nexus_techniques_${userId}`) || {};
    const journalEntries = getItem('study_nexus_journal_entries') || [];
    const dailyGoals = getItem('sanctuary_daily_study_goals') || [];
    const theme = localStorage.getItem('soft_study_sanctuary_theme') || 'rainy';
    const focusHistory = getItem('sanctuary_focus_history') || [];
    const customTracks = getItem('aesthetic_study_custom_spotify_tracks') || [];

    const payload: WorkspaceBackupPayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      appId: 'study-sanctuary',
      userId,
      data: {
        courses,
        documents,
        tasks,
        events,
        flashcards,
        quizzes,
        journalEntries,
        dailyGoals,
        theme,
        strategies,
        techniques,
        focusHistory,
        customTracks
      }
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanctuary_workspace_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    haptic.trigger('success');
  } catch (error) {
    console.error('Failed to export workspace backup:', error);
    haptic.trigger('error');
    throw new Error('Failed to generate backup file.');
  }
}

/**
 * Validates and imports a JSON backup file into localStorage.
 */
export function importWorkspaceBackup(
  file: File, 
  userId: string = 'guest'
): Promise<{ success: boolean; stats: string; message: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error('File content is empty.');
        }

        const payload = JSON.parse(text) as WorkspaceBackupPayload;

        if (!payload || !payload.data) {
          throw new Error('Invalid JSON structure: missing payload data field.');
        }

        const { data } = payload;

        // Restore to localStorage
        const setItem = (key: string, value: any) => {
          if (value !== undefined && value !== null) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        };

        if (Array.isArray(data.courses)) setItem(`soft_study_user_courses_${userId}`, data.courses);
        if (Array.isArray(data.documents)) setItem(`soft_study_user_documents_${userId}`, data.documents);
        if (Array.isArray(data.tasks)) setItem(`study_nexus_tasks_${userId}`, data.tasks);
        if (Array.isArray(data.events)) setItem(`study_nexus_events_${userId}`, data.events);
        if (Array.isArray(data.flashcards)) setItem(`study_nexus_flashcards_${userId}`, data.flashcards);
        if (Array.isArray(data.quizzes)) setItem(`study_nexus_quizzes_${userId}`, data.quizzes);
        if (Array.isArray(data.journalEntries)) setItem('study_nexus_journal_entries', data.journalEntries);
        if (Array.isArray(data.dailyGoals)) setItem('sanctuary_daily_study_goals', data.dailyGoals);
        if (data.theme) localStorage.setItem('soft_study_sanctuary_theme', data.theme);
        if (data.strategies) setItem(`study_nexus_strategies_${userId}`, data.strategies);
        if (data.techniques) setItem(`study_nexus_techniques_${userId}`, data.techniques);
        if (Array.isArray(data.focusHistory)) setItem('sanctuary_focus_history', data.focusHistory);
        if (Array.isArray(data.customTracks)) setItem('aesthetic_study_custom_spotify_tracks', data.customTracks);

        const taskCount = data.tasks?.length || 0;
        const courseCount = data.courses?.length || 0;
        const journalCount = data.journalEntries?.length || 0;
        const docCount = data.documents?.length || 0;

        haptic.trigger('success');

        resolve({
          success: true,
          stats: `${courseCount} courses, ${taskCount} tasks, ${journalCount} journals, ${docCount} documents`,
          message: 'Workspace successfully restored!'
        });
      } catch (err: any) {
        haptic.trigger('error');
        reject(new Error(err.message || 'Invalid backup file format.'));
      }
    };

    reader.onerror = () => {
      haptic.trigger('error');
      reject(new Error('Failed to read the backup file.'));
    };

    reader.readAsText(file);
  });
}

/**
 * Resets user local storage data to clean slate
 */
export function clearWorkspaceData(userId: string = 'guest'): void {
  try {
    localStorage.removeItem(`soft_study_user_courses_${userId}`);
    localStorage.removeItem(`soft_study_user_documents_${userId}`);
    localStorage.removeItem(`study_nexus_tasks_${userId}`);
    localStorage.removeItem(`study_nexus_events_${userId}`);
    localStorage.removeItem(`study_nexus_flashcards_${userId}`);
    localStorage.removeItem(`study_nexus_quizzes_${userId}`);
    localStorage.removeItem(`study_nexus_strategies_${userId}`);
    localStorage.removeItem(`study_nexus_techniques_${userId}`);
    localStorage.removeItem('study_nexus_journal_entries');
    localStorage.removeItem('sanctuary_daily_study_goals');
    haptic.trigger('medium');
  } catch (err) {
    console.error('Error clearing workspace data:', err);
  }
}
