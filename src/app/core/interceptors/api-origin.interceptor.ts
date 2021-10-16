import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';


@Injectable()
export class ApiOriginInterceptor implements HttpInterceptor {

  constructor() {}

  /**
   * Intercepts HTTP request and updates its URL with apiOrigin unless it
   * already has an origin.
   *
   * @param request HTTP request
   * @param next Next HTTP request handler
   */
  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (this.hasOrigin(request)) { return next.handle(request); }

    const url = environment.apiOrigin + request.url;
    const updatedRequest = request.clone({ url });
    return next.handle(updatedRequest);
  }

  /**
   * Checks if HTTP request already has an origin
   *
   * @param request HTTP request
   */
  private hasOrigin(request: HttpRequest<unknown>): boolean {
    return request.url.includes('://');
  }

}
