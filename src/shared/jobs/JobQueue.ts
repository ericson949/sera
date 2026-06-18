export class JobQueue {
  private queue: { id: string; task: () => Promise<void> }[] = [];
  private knownJobs = new Set<string>();
  private activeCount = 0;

  constructor(private readonly maxConcurrency = 5) {}

  enqueue(id: string, task: () => Promise<void>, priority = false) {
    if (this.knownJobs.has(id)) {
      if (priority) this.promote(id);
      return;
    }
    this.knownJobs.add(id);
    if (priority) this.queue.unshift({ id, task });
    else this.queue.push({ id, task });
    this.drain();
  }

  private promote(id: string) {
    const index = this.queue.findIndex((job) => job.id === id);
    if (index < 1) return;
    const [job] = this.queue.splice(index, 1);
    this.queue.unshift(job);
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
