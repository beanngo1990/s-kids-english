export class ReminderUpdateGuard {
  private isPending = false;
  private revision = 0;

  beginUpdate(): boolean {
    if (this.isPending) {
      return false;
    }

    this.revision += 1;
    this.isPending = true;
    return true;
  }

  finishUpdate() {
    if (!this.isPending) {
      return;
    }

    this.revision += 1;
    this.isPending = false;
  }

  captureRefreshRevision(): number {
    return this.revision;
  }

  canApplyRefresh(refreshRevision: number): boolean {
    return !this.isPending && refreshRevision === this.revision;
  }
}
