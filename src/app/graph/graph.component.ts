import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AwsService} from '../../app/services/aws.service';

declare var $;
declare var _;
declare var moment;
declare var cytoscape;

const DATE_FORMAT:string = 'DD/MM/YYYY';
const SECONDS_IN_A_DAY:number = 86400;
const SIZE_FACTOR = 5;

// Convert dates into a number we can use to define distances on the graph
let normalizeDate = (date) => moment(date, DATE_FORMAT).unix() * SIZE_FACTOR / SECONDS_IN_A_DAY;


let evaluateXPosition = (element)=>{
    element.data.label = `${element.data.id}: ${element.data.startDate} to ${element.data.endDate}`
    element.position = {
        x: normalizeDate(element.data.startDate)
    }
    element.data.width = normalizeDate(element.data.endDate) + SIZE_FACTOR - element.position.x; // SIZE_FACTOR is added for same-day tasks
    element.position.x = element.position.x + element.data.width/2;
}

// We move the entire graph to the left so that the first task starts at x=0
let normalizePosition = (element, min)=>{
    element.position.x = element.position.x - min;
}

let normalizePositions = (nodes)=>{
    var min = _.min(_.map(nodes, element => element.position.x))
    nodes.forEach(element => {    
        normalizePosition(element, min);
    });
    
}

let evaluatePositions = (nodes) => {

  nodes.forEach(element => {
      evaluateXPosition(element);
  });
  // sort the nodes vertically, first by startDate and then by duration
  var y = 0;
  var leftMostPointOfNode = (el) => el.position.x - el.data.width/2;
  var horizontalSizeOfNode = (el) => el.data.width;
  _.sortBy(nodes, [leftMostPointOfNode, horizontalSizeOfNode]).forEach(el => el.position.y = 150*y++)
  // We move the entire graph to the left so that the first task starts at x=0
  normalizePositions(nodes)

}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.less']
})
export class GraphComponent implements OnInit {

  @Output() dataLoadComplete = new EventEmitter<any>()
  @Output() graphRenderingComplete = new EventEmitter()

  load = () => {
      this.aws.getGraph().then(graph=>{
          var nodes = _.filter(graph.data, (el)=>!el.data.source);
          var orderedNodes = _.orderBy(_.map(nodes, el => el.data), el => parseInt(el.id));
          this.dataLoadComplete.emit(orderedNodes);
          evaluatePositions(nodes);
          var cy = cytoscape({
              container: $('#graph-container')[0],
              elements: graph.data,
              autolock: true,
              style: [ // the stylesheet for the graph
                  {
                      selector: 'node',
                      style: {
                          shape: 'rectangle',
                          width:'data(width)',
                          height: 100,
                          'background-color': '#666',
                          'label': 'data(label)',
                          'text-halign': 'left'
                      }
                  },
              
                  {
                      selector: 'edge',
                      style: {
                          'width': 3,
                          'line-color': '#ccc',
                          'mid-target-arrow-color': '#ccc',
                          'mid-target-arrow-shape': 'triangle',
                          'label': 'data(id)'
                      }
                  }
              ],
              
                layout: {
                  name: 'preset'
                }
          })
          cy.viewport(0.5, {x: -100, y: -200})
          this.graphRenderingComplete.emit();
      })

  }
  constructor(private aws: AwsService) { }

  ngOnInit() {
  }

}
