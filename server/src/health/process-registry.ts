import { ChildProcess } from 'child_process';

export interface TrackedProcess {
  pid: number;
  type: string;
  label: string;
  status: 'running' | 'exited';
  exitCode: number | null;
  stderrTail: string[];
}

const processes = new Map<number, TrackedProcess>();

export const ProcessRegistry = {
  register(child: ChildProcess, type: string, label: string) {
    const pid = child.pid!;
    const entry: TrackedProcess = {
      pid, type, label, status: 'running', exitCode: null, stderrTail: [],
    };
    processes.set(pid, entry);

    child.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      entry.stderrTail.push(...lines);
      if (entry.stderrTail.length > 5) {
        entry.stderrTail = entry.stderrTail.slice(-5);
      }
    });

    child.on('exit', (code) => {
      entry.status = 'exited';
      entry.exitCode = code;
      setTimeout(() => processes.delete(pid), 60_000);
    });
  },

  list(): TrackedProcess[] {
    return [...processes.values()];
  },
};
