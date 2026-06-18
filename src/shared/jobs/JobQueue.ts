export class JobQueue {
  private queue: { id: string; task: () => Promise<void> }[] = [];
  private knownJobs = new Set<string>();
  private activeCount = 0;

  constructor(private readonly maxConcurrency = 5) {}

  enqueue(id: string, task: () => Promise<void>) {
    if (this.knownJobs.has(id)) return;
    this.knownJobs.add(id);
    this.queue.push({ id, task });
    this.drain();
  }

  private drain() {
    while (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) return;

      this.activeCount++;
      void job.task()
        .catch((error) => console.error(`Job ${job.id} failed:`, error))
        .finally(() => {
          this.activeCount--;
          this.knownJobs.delete(job.id);
          this.drain();
        });
    }
  }
}

const globalForQueue = globalThis as unknown as { jobQueue?: JobQueue };
export const jobQueue = globalForQueue.jobQueue ?? new JobQueue();
if (process.env.NODE_ENV !== "production") globalForQueue.jobQueue = jobQueue;
