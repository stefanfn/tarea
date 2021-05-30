import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

type task = {task_id: number, text: string, lasts: number, due: string};

@Component({
  selector: 'app-aufgaben',
  templateUrl: './aufgaben.component.html',
  styleUrls: ['./aufgaben.component.css']
})
export class AufgabenComponent implements OnInit {

  @Input() aufgaben: Array<task> = [];

  @Output() select = new EventEmitter<task|null>();

  constructor() { }

  ngOnInit(): void {
    this.select.emit(this.aufgaben.length === 0 ? null : this.aufgaben[0]);
  }

  onChange(event: Event): void {
    let t = event.target as any;
    var selection: number = t.value;
    this.select.emit(
      this.aufgaben.find(
        function (aufgabe: task) {
          return aufgabe.task_id == selection;
        }
      )
    );
  }

}
