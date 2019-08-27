import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as auth0 from 'auth0-js';

(window as any).global = window;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn$ = new Subject();
  isLoggedIn: Boolean = false;
  auth0 = new auth0.WebAuth({
    clientID: 'rPKlTNNUcAi310G9X1ZkIERZOeqSE5XX',
    domain: 'bestbeans.auth0.com',
    responseType: 'token id_token',
    audience: 'https://bestbeans.auth0/userinfo',
    redirectUri: 'http://localhost:8100/callback',
    scope: 'openid'
  });

  constructor(public router: Router) {
    const loggedIn = this.isLoggedIn = this.isAuthenticated();
    this.isLoggedIn$.next(loggedIn);
  }

  public login(): void {
    this.auth0.authorize();
  }

  // This method is called when the authentication process is finished.
  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {

      // If the user is successfully logged in, set isLoggedIn = true and
      // redirect user to /home
      if(authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.window.setSession(authResult);
        const loggedIn = this.isLoggedIn = true;
        this.isLoggedIn$.next(loggedIn);
        this.router.navigate(['/home']);
      }
      // Else if authentication is not successful, it sets this.isloggedIn
      // to false but also redirects to the /home route
      else if(err) {
        const loggedIn = this.isLoggedIn = false;
        this.isLoggedIn$.next(loggedIn);
        this.router.navigate(['/home']);
      }
      console.log(this.isLoggedIn);
    });
  }

  // This method stores user's login information like access_token, id_token,
  // and expires_at into local storage to facilitate the management of these data.
  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  // This method removes all information about logged in user from local storage
  // and sets this.loggedin value to false
  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');

    // Go back to the home route
    const loggedIn = this.isLoggedIn = false;
    this.isLoggedIn.next(loggedIn);
  }

  // This method checks if the user is authenticated or not by checking the
  // token expiration date from local storage
  public isAuthenticated(): boolean {
    // Check whether the current time is past the access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
    return new Date().getTime() < expiresAt;
  }
}
