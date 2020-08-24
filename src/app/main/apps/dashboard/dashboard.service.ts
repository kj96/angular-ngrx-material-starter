// outer
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// inner
// end

@Injectable()
export class DashboardService {
  /**
   * Constructor
   *
   * @param _httpClient
   */
  constructor(private _httpClient: HttpClient) {}
}
