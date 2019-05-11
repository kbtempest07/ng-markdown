import { Directive, ElementRef, Input, OnInit } from "@angular/core";

@Directive({
  selector: "[ccMarkDown]"
})
export class MarkdownDirective implements OnInit {
  @Input() value: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.backgroundColor = this.value;
    this.el.nativeElement.innerHTML = `${this.value}`;
  }
}
