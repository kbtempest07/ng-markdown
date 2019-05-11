import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "CodeSandbox";
  greenColor = "green";
  redColor = "red";
  color = "red";
  onValueChange(event) {
    console.log("event:", event);
  }
}
