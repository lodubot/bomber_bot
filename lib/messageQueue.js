import chalk from "chalk";

class Scheduler {
  constructor(concurrency, delay = 0) {
    this.queue = [];
    this.concurrency = concurrency;
    this.running = 0;
    this.delay = delay; // delay between tasks
  }

  async runTask(task) {
    this.running += 1;
    try {
      const response = await task();
      return response;
    } catch (error) {
      console.error(chalk.red("❌ Task failed:"), error);
      throw error;
    } finally {
      this.running -= 1;

      // optional delay before running next task
      if (this.delay > 0) {
        await new Promise((res) => setTimeout(res, this.delay));
      }

      this.getTask();
    }
  }

  getTask() {
    if (this.running < this.concurrency && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      nextTask();
    }
  }

  addTask(task) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          const result = await this.runTask(task);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      if (this.running < this.concurrency) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }
}

export default Scheduler;
