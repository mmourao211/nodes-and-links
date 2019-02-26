import { isPlatformBrowser , DOCUMENT} from '@angular/common';
import { environment } from '../environments/environment';
import { Component , OnInit, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { NgxSpinnerService } from 'ngx-spinner';
import {GraphComponent} from '../app/graph/graph.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
    @ViewChild(GraphComponent)
    private graph: GraphComponent

    public tableOptions = {
        rows: [],
        columns: [
            {
                title: 'ID', 
                name: 'id'
            },
          {
            title: 'Start Date',
            name: 'startDate'
          },
          {
            title: 'End Date',
            name: 'endDate'
          }
        ],
        config: {
          className: ['table-striped', 'table-bordered']
        }
    }

    fileStateChange = ($event)=>{
        if($event.state == 'started'){
            this.spinner.show();
        }
        else{
            this.graph.load();
        }
    }
    loadComplete = (nodes)=>{
        this.tableOptions.rows = nodes;
    }
    renderingComplete = () => {
        this.spinner.hide();
    }
    public ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            let bases = this.document.getElementsByTagName('base');
    
            if (bases.length > 0) {
                bases[0].setAttribute('href', environment.baseHref);
            }
        }
        this.spinner.show();
        this.graph.load();
    
    if (!isPlatformBrowser(this.platformId)) {
        let bases = this.document.getElementsByTagName('base');

        if (bases.length > 0) {
            bases[0].setAttribute('href', environment.baseHref);
        }
    }
}


 constructor(@Inject(PLATFORM_ID) private platformId: any, @Inject(DOCUMENT) private document: any, private spinner: NgxSpinnerService) {}
}
