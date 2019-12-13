import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IRepo } from "../helpers/interfaces";
import { uniqBy } from "../helpers/functions";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from './auth.services';
import { Router } from '@angular/router';

const baseUrl = "http://localhost:8080/";

@Injectable({
  providedIn: "root"
})
export class BookmarksService {
  public bookmarksSubject: BehaviorSubject<Array<IRepo>> = new BehaviorSubject<
    Array<IRepo>
  >([]);
  
  constructor(private httpClient: HttpClient, private authService: AuthService, private router: Router) {
    this.getBookmarks();
  }

 
  getBookmarks() {
    if(!this.authService.getIsAuth()) return;
    this.httpClient
      .get<Array<IRepo>>(`${baseUrl}projects`)
      .toPromise()
      .then(res => {
        this.bookmarksSubject.next(res);
      });
  }

  addToBookmarks(item: IRepo) {
    if(!this.authService.getIsAuth()) return;
    return this.httpClient
      .post<IRepo>(
        `${baseUrl}projects`,
        { name: item.name, author: item.author }
      )
      .toPromise()
      .then(res => {
        const values = uniqBy([...this.bookmarksSubject.value, res], "name");
        this.bookmarksSubject.next(values);
        return values;
      }).catch(e => {
        this.router.navigate(["/login"]);
      });
  }

  removeFromBookmarks(item: IRepo) {
    if(!this.authService.getIsAuth()) return;
    return this.httpClient
      .delete(`${baseUrl}projects/${item.id}`)
      .toPromise()
      .then(res => {
        const values = this.bookmarksSubject.value.filter(
          ({ name }) => name !== item.name
        );
        this.bookmarksSubject.next(values);
        return values;
      }).catch(e => {
        this.router.navigate(["/login"]);
      });
  }
  
}
