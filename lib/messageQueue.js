class Scheduler {
  constructor(concurrency) {
    this.queue = [];
    this.concurrency = concurrency;
    this.running = 0;
  }

  getTask() {
    if (this.running < this.concurrency && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      nextTask();
    }
  }

  addTask(task) {
    function __runTask() {
      return new Promise(async (res, rej) => {
        this.running += 1;
        try {
          const response = await task();
          res(response);
        } catch (error) {
          console.log("Something Went Wrong: " + error);
          rej(error);
        } finally {
          this.running -= 1;
          this.getTask();
        }
      });
    }

    if (this.running < this.concurrency) {
      __runTask.call(this);
    } else {
      this.queue.push(__runTask.bind(this));
    }
  }
}

export default Scheduler;
