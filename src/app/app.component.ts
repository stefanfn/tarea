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

  loadedAufgaben: Array<task> = [];

  selection: task | null = null;

  allTasks: boolean = false;

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

}
