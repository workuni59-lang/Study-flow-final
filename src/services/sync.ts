import { supabase } from '../lib/supabase';

type TableName = 'tasks' | 'subjects' | 'gamification_state';

interface PendingChange {
  id: string;
  table: TableName;
  operation: 'upsert' | 'delete';
  data: Record<string, any>;
  retries: number;
  createdAt: string;
}

export interface PullResult {
  tasks: Record<string, any>[];
  subjects: Record<string, any>[];
  gamification: Record<string, any> | null;
}

const QUEUE_KEY = 'study_flow_sync_queue';
const DEAD_LETTER_KEY = 'study_flow_sync_dead_letter';
const MAX_RETRIES = 5;
const BASE_DEBOUNCE_MS = 2000;

class SyncService {
  private queue: PendingChange[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private processing = false;
  private _userId: string | null = null;
  private _online = navigator.onLine;
  private _listenersAttached = false;
  private _isPremium = true;

  get userId(): string | null {
    return this._userId;
  }

  get online(): boolean {
    return this._online;
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  get deadLetterCount(): number {
    try {
      const raw = localStorage.getItem(DEAD_LETTER_KEY);
      return raw ? JSON.parse(raw).length : 0;
    } catch { return 0; }
  }

  retryDeadLetters(): void {
    try {
      const raw = localStorage.getItem(DEAD_LETTER_KEY);
      if (!raw) return;
      const dead: PendingChange[] = JSON.parse(raw);
      localStorage.removeItem(DEAD_LETTER_KEY);
      this.queue = [...this.queue, ...dead.map(d => ({ ...d, retries: 0 }))];
      this.saveQueue();
      this.schedule();
    } catch {}
  }

  setPremium(premium: boolean): void {
    this._isPremium = premium;
    if (!premium) {
      this.queue = [];
      this.saveQueue();
      if (this.timer) clearTimeout(this.timer);
    } else if (this.queue.length > 0) {
      this.schedule();
    }
  }

  enqueueAll(items: { table: TableName; data: Record<string, any> }[]): void {
    if (!this._userId || !supabase || !this._isPremium) return;
    for (const item of items) {
      this.queue = this.queue.filter(q => !(q.table === item.table && q.data.id === item.data.id));
      const now = new Date().toISOString();
      this.queue.push({
        id: `${item.table}_${item.data.id}_${now}`,
        table: item.table,
        operation: 'upsert',
        data: { ...item.data, updated_at: item.data.updated_at ?? now },
        retries: 0,
        createdAt: now,
      });
    }
    this.saveQueue();
    this.schedule();
  }

  init(userId: string | null): void {
    this._userId = userId;
    this.attachListeners();
    if (userId) {
      this.loadQueue();
      if (this.queue.length > 0) this.schedule();
    } else {
      this.queue = [];
      this.saveQueue();
    }
  }

  private attachListeners(): void {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    window.addEventListener('online', () => {
      this._online = true;
      if (this.queue.length > 0) this.schedule();
    });
    window.addEventListener('offline', () => {
      this._online = false;
    });
  }

  enqueue(table: TableName, operation: 'upsert' | 'delete', data: Record<string, any>): void {
    if (!this._userId) return;
    if (!supabase) return;
    this.queue = this.queue.filter(q => !(q.table === table && q.data.id === data.id));
    const now = new Date().toISOString();
    this.queue.push({
      id: `${table}_${data.id}_${now}`,
      table,
      operation,
      data: { ...data, updated_at: data.updated_at ?? now },
      retries: 0,
      createdAt: now,
    });
    this.saveQueue();
    this.schedule();
  }

  async pullAll(userId: string): Promise<PullResult> {
    const empty: PullResult = { tasks: [], subjects: [], gamification: null };
    if (!supabase) return empty;

    const [tasksRes, subjectsRes, gamificationRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('gamification_state').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    return {
      tasks: tasksRes.data ?? [],
      subjects: subjectsRes.data ?? [],
      gamification: gamificationRes.data ?? null,
    };
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.processing) return;
    const nextRetry = this.queue.length > 0
      ? BASE_DEBOUNCE_MS * Math.pow(2, Math.min(this.queue[0].retries, 4))
      : BASE_DEBOUNCE_MS;
    this.timer = setTimeout(() => this.process(), nextRetry);
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    if (!supabase) return;
    if (!this._online) {
      this.processing = false;
      this.schedule();
      return;
    }
    if (!this._isPremium) {
      this.queue = [];
      this.saveQueue();
      this.processing = false;
      return;
    }
    this.processing = true;

    while (this.queue.length > 0) {
      const change = this.queue[0];
      if (!change) break;
      try {
        if (change.operation === 'upsert') {
          const payload = { ...change.data, user_id: this._userId, updated_at: new Date().toISOString() };
          const conflict = change.table === 'gamification_state' ? 'user_id' : 'id';
          const { error } = await supabase
            .from(change.table)
            .upsert(payload, { onConflict: conflict });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from(change.table)
            .delete()
            .eq('id', change.data.id)
            .eq('user_id', this._userId);
          if (error) throw error;
        }
        this.queue.shift();
        this.saveQueue();
      } catch (err) {
        console.warn(`[Sync] error ${change.table}/${change.data.id}:`, err);
        change.retries++;
        if (change.retries >= MAX_RETRIES) {
          console.warn(`[Sync] moving to dead letter after ${MAX_RETRIES} retries:`, change.table, change.data.id);
          this.queue.shift();
          this.saveQueue();
          this.addDeadLetter(change);
        } else {
          this.queue.shift();
          this.queue.push(change);
          this.saveQueue();
          break;
        }
      }
    }

    this.processing = false;
    if (this.queue.length > 0) this.schedule();
  }

  private addDeadLetter(change: PendingChange): void {
    try {
      const raw = localStorage.getItem(DEAD_LETTER_KEY);
      const dead: PendingChange[] = raw ? JSON.parse(raw) : [];
      dead.push(change);
      localStorage.setItem(DEAD_LETTER_KEY, JSON.stringify(dead.slice(-50)));
    } catch {}
  }

  private loadQueue(): void {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      this.queue = raw ? JSON.parse(raw) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      if (this.queue.length > 0) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      } else {
        localStorage.removeItem(QUEUE_KEY);
      }
    } catch {}
  }
}

export const sync = new SyncService();
