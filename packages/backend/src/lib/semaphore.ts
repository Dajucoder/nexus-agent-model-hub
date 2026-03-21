export class Semaphore {
  private current = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly limit: number) {}

  async use<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
    if (this.current < this.limit) {
      this.current += 1;
      return;
    }

    await new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.current += 1;
        resolve();
      });
    });
  }

  private release(): void {
    this.current -= 1;
    const next = this.queue.shift();
    next?.();
  }
}
