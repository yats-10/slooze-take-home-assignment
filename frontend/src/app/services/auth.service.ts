import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    country: string;
  };
}

interface JwtPayload {
  sub: number;
  userId: number;
  role: string;
  country: string;
  exp: number;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private apiUrl = "https://slooze-take-home-assignment-production.up.railway.app/auth"; 
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem("token", res.access_token);
          localStorage.setItem("user", JSON.stringify(res.user));
        }),
      );
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRole(): string {
    const user = this.getUser();
    return user?.role ?? "";
  }

  getCountry(): string {
    const user = this.getUser();
    return user?.country ?? "";
  }

  getUserName(): string {
    const user = this.getUser();
    return user?.name ?? "";
  }

  private getUser(): LoginResponse["user"] | null {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): JwtPayload {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  }
}
