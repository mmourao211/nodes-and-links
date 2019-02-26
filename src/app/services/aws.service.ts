import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {apigClientFactory} from '../../apigClient.js';

@Injectable({
  providedIn: 'root'
})
export class AwsService {

  constructor(private http: HttpClient) { }

  getGraph = () => {
    return (window as any).apigClientFactory.newClient().graphGet({inttype:'RequestResponse'})
}

}
