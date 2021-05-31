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

  readonly URL_BASE = 'http://localhost:42956/';
  readonly URL_CREATE = this.URL_BASE + 'create';
  readonly URL_UPDATE = this.URL_BASE + 'update';

  loadedAufgaben: Array<task> = [];

  selection: task | null = null;

  allTasks: boolean = false;

  editMode: boolean = false;

  constructor(private http: HttpClient) {}

  deploy(tasks: any) {
    this.loadedAufgaben = tasks;
    this.selection = Array.isArray(tasks) && tasks.length > 0 ? tasks[0] : null;

  }

  ngOnInit(): void {
    this.http.get(this.URL_BASE)
      .subscribe(this.deploy.bind(this));
  }

  onAufgabeSelect(selection: task | null): void {
    this.selection = selection;
  }

  onChangeAllTasks(): void {
    this.allTasks = !this.allTasks;
    this.http.get(this.URL_BASE + '?all=' + (this.allTasks ? 'true' : 'false'))
      .subscribe(this.deploy.bind(this));
  }

  onChangeDue(target: any): void {
    if (!this.selection || !target.value) {
      return;
    }
    this.selection.due = target.value;
  }

  onChangeLasts(target: any): void {
    if (!this.selection || !target.value) {
      return;
    }
    this.selection.lasts = parseInt(target.value);
  }

  onChangeText(target: any): void {
    if (!this.selection || !target.value) {
      return;
    }
    this.selection.text = target.value;
  }

  onClickCancel(): void {
    this.editMode = false;
  }

  onClickCreate(): void {
    this.http.get(this.URL_CREATE)
     .subscribe(this.deploy.bind(this));
  }

  onClickDone(): void {
    if (!this.selection) {
      return;
    }
    this.http.put(this.URL_BASE, {task: this.selection.task_id})
      .subscribe(this.deploy.bind(this));
  }

  onClickEdit(): void {
    this.editMode = true;
  }

  onClickSave(): void {
    this.http.put(this.URL_UPDATE, {task: this.selection})
      .subscribe(this.deploy.bind(this));
    this.editMode = false;
  }

}
