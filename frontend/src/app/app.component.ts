import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    try {
      document.body.classList.remove('dark');  
      localStorage.removeItem('theme');        
    } catch {}
  }
}
