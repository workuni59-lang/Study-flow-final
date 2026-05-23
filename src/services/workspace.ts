
export interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

export interface GoogleTask {
  title: string;
  notes?: string;
  due?: string;
}

export class WorkspaceService {
  private accessToken: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // --- Calendar ---

  async createCalendarEvent(event: CalendarEvent) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Calendar API Error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async listCalendarEvents() {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    return response.json();
  }

  // --- Tasks ---

  async createTaskList(title: string) {
    const response = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });
    return response.json();
  }

  async createTask(taskListId: string = '@default', task: GoogleTask) {
    const response = await fetch(`https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    });

    if (!response.ok) {
       const error = await response.json();
       throw new Error(`Tasks API Error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }
}
