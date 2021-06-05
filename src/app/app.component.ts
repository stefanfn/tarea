import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type task = {task_id: number, text: string, lasts: number, due: string};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tarea';

  readonly URL_BASE = 'http://coolmule.de:42956/';
  readonly URL_CREATE = this.URL_BASE + 'create';
  readonly URL_UPDATE = this.URL_BASE + 'update';

  readonly EMPTY_TASK = {task_id: 0, text: '', lasts: 0, due: ''};

  loadedAufgaben: Array<task> = [];

  selectedTask: task = this.EMPTY_TASK;

  selectedTaskId: number | null = null;

  private allTasks: boolean = false;

  editMode: boolean = false;

  constructor(private http: HttpClient) {}

  deploy(selectedTaskId: number | null, tasks: any) {
    this.loadedAufgaben = tasks || [];
    this.selectedTaskId = selectedTaskId || this.loadedAufgaben[0] && this.loadedAufgaben[0].task_id;
    this.selectedTask = this.selectedTaskId && this.findTaskById(this.selectedTaskId) || this.EMPTY_TASK;
  }

  findTaskById(taskId: number): task | null {
    return this.loadedAufgaben.find(
      function (aufgabe: task) {
        return aufgabe.task_id == taskId;
      }
    ) || null;
  }

  ngOnInit(): void {
    this.http.get(this.URL_BASE).subscribe(this.deploy.bind(this, null));
  }

  onAufgabeSelect(selectedTaskId: number | null): void {debugger
    this.selectedTaskId = selectedTaskId;
    this.selectedTask =
      selectedTaskId && this.findTaskById(selectedTaskId) || this.EMPTY_TASK;
  }

  onChangeAllTasks(): void {
    let selectedTaskId = this.selectedTaskId;
    this.allTasks = !this.allTasks;
    this.http.get(this.URL_BASE + '?all=' + (this.allTasks ? 'true' : 'false'))
      .subscribe(this.deploy.bind(this, selectedTaskId));
  }

  onChangeDue(target: any): void {
    if (!this.selectedTask || !target.value) {
      return;
    }
    this.selectedTask.due = target.value;
  }

  onChangeLasts(target: any): void {
    if (!this.selectedTask || !target.value) {
      return;
    }
    this.selectedTask.lasts = parseInt(target.value);
  }

  onChangeSelectedTask(): void {
    this.selectedTask = this.selectedTaskId && this.findTaskById(this.selectedTaskId) || this.EMPTY_TASK;
  }

  onChangeText(target: any): void {
    if (!this.selectedTask || !target.value) {
      return;
    }
    this.selectedTask.text = target.value;
  }

  onClickCancel(): void {
    this.editMode = false;
  }

  onClickCreate(): void {
    this.http.get(this.URL_CREATE)
     .subscribe(this.deploy.bind(this, this.selectedTask ? this.selectedTask.task_id : null));
  }

  onClickDone(): void {
    if (!this.selectedTask) {
      return;
    }
    this.http.put(this.URL_BASE, {task: this.selectedTask.task_id})
      .subscribe(this.deploy.bind(this, this.selectedTask ? this.selectedTask.task_id : null));
  }

  onClickEdit(): void {
    this.editMode = true;
  }

  onClickSave(): void {
    this.http.put(this.URL_UPDATE, {task: this.selectedTask})
      .subscribe(this.deploy.bind(this, this.selectedTask ? this.selectedTask.task_id : null));
    this.editMode = false;
  }

}
