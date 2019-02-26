import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MomentModule } from 'ngx-moment';
import { NgxUploaderModule } from 'ngx-uploader';
import { Ng2TableModule } from 'ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { GraphComponent } from './graph/graph.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    GraphComponent
  ],
  imports:[
    NgxSpinnerModule,
    Ng2TableModule,
    NgxUploaderModule,
    MomentModule,
 CommonModule,
NgtUniversalModule,
 
 TransferHttpCacheModule,
HttpClientModule
  ],
  providers: [],
})
export class AppModule { }
