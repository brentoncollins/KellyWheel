/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";
import "core-js/stable";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import { dict } from './images'; 
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import * as d3 from "d3";

import {
    TooltipEventArgs,
    TooltipEnabledDataPoint,
    createTooltipServiceWrapper,
    ITooltipServiceWrapper,
} from 'powerbi-visuals-utils-tooltiputils'


type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;



export class Visual implements IVisual {
    private element: HTMLElement;
    private isLandingPageOn: boolean;
    private LandingPageRemoved: boolean;
    private LandingPage: Selection<any>;
    private host: IVisualHost;
    private svg: Selection<SVGElement>;
    private container: Selection<SVGElement>;
    private containertest: Selection<SVGElement>;
    private arr = new Array();
    private arrDots = new Array();
    private arrSegments = new Array();
    private singleSegment: number;
    private categorys: number = 17;
    private CenterarrayOffset_dots = new Array();
    private CenterarrayOffset_images = new Array();
    virificationArray: string[];
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    


    constructor(options: VisualConstructorOptions) {
        this.element = options.element;
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('circleCard', true);
        this.host = options.host;

        this.container = this.svg.append("g")
            .classed('container', true);

        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
    }

    // Get the tooltip date and return list
    public getTooltipData(value: any): VisualTooltipDataItem[] {
        return [{
            displayName: "CCFV Sub category",
            value: value,
            color: "value.color",
             header: "CCFV Sub category"
                }];
            }
    // TO DO fix the landing page.
    private HandleLandingPage(options: VisualUpdateOptions) {
        
        if(!options.dataViews || !options.dataViews.length) {
            if(!this.isLandingPageOn) {
                this.isLandingPageOn = true;
                
                const SampleLandingPage: Element = this.createSampleLandingPage();
                this.element.appendChild(SampleLandingPage);

                this.LandingPage = d3.select(SampleLandingPage);
                
            }

        } else {
                if(this.isLandingPageOn && !this.LandingPageRemoved){
                    this.LandingPageRemoved = true;
                    this.LandingPage.remove();
                }
        }
    }
    // TO DO Fix landing page
    private createSampleLandingPage(): Element {
        let div = document.createElement("div");
        
        let header = document.createElement("h1")
        header.textContent = "Sample Bar Chart Landing Page";
        header.setAttribute("class","LandingPage");
        
        let p1 = document.createElement("a");
        p1.setAttribute("class", "LandingPageHelpLink");
        p1.textContent = "Learn more about Landing page";
        div.appendChild(header);
        div.appendChild(p1);
        
        return div;
    }
   
    // Update visual
    public update(options: VisualUpdateOptions) {
        
        
        let dataView_: DataView = options.dataViews[0];         // Data
        let width: number = options.viewport.width;             // Get Width update
        let height: number = options.viewport.height;           // Get Height Update
        this.svg.attr("width", width);                          // Width update
        this.svg.attr("height", height);                        // Height Update
        let radius: number = Math.min(width, height) / 2.3;     // Set radius of kelly wheel
        let radiusDot: number = Math.min(width, height) / 250;  // Set radius of dote

        let centerOffset: number;                               // Center ofset for each dot
        let cX: number;                                         // Line angle
        let cY: number;                                         // Line angle
        let cXOffset: number;                                   // Outer offset
        let cYOffset: number;                                   // Outer offset
        let counterCCFV: number;                                // CCFV array counter
        let counterCCFV_Type: number;                           // CCFV type counter
        let colourCCFV: string;                                 // Complince colour
        this.CenterarrayOffset_dots = new Array();              // Center offset for CCFV dots - changes on every loop
        this.CenterarrayOffset_images = new Array(); 
        this.arr = new Array();             // Center offset for CCFV Images
        this.virificationArray = new Array();                   // Array to hold all CCFV types
        let colourString: string;                               // Yes/No Green/Red string

        // To prevent from drawing everyting over and over again, remove all drawing and start again.
        this.svg.selectAll('line').remove();
        this.svg.selectAll('circle').remove();
        this.svg.selectAll('image').remove();
        

        // TO DO sort out the landing page
        this.HandleLandingPage(options);

      
        // Loop through the dataview array and collect each CCFV type and add it to the virification array.
        for (var j = 0; j < dataView_.table.rows.length; j++) {
           
            if (
                this.virificationArray.indexOf(dataView_.table.rows[j][2].toString().toUpperCase()) > -1){
                }
                else{
                    this.virificationArray.push(String(dataView_.table.rows[j][2].toString().toUpperCase()))
                }
            }

        // Add the main kelly wheel circly
        let circle = this.container.append("circle")            
        .style("stroke", "black")
        .style("stroke-width", 2)
        .attr("r", radius)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", "#ffe500");
            
        // Add the lines for the categorys to split the kelly wheel into 17 sections
        for (let i = 0; i < this.categorys; i++) {
            this.arr.push(this.container.append("line"));
        }

        // Calculate the single segments of the kelly wheel in deg of 360
        this.singleSegment = 360 / this.arr.length;
        for (var i = 0; i < this.arr.length; i++) {
            this.arrSegments.push(this.singleSegment * i)
        }

        // Create arrays for each virification type
        for (var a = 0; a < this.virificationArray.length; a++) {

            this.arrDots[a] = new Array();
            counterCCFV_Type = 0

           // Add circle objects to the array holding the circles
            for (var j = 0; j < dataView_.table.rows.length; j++) {
             
                if (
                    dataView_.table.rows[j][2].toString().toUpperCase() == this.virificationArray[a]) {
                    counterCCFV_Type = counterCCFV_Type + 1
                }
            }
            // Add each circle object in the array to the container.
            for (var i = 0; i < counterCCFV_Type; i++) {
                this.arrDots[a].push(this.container.append("circle"));
            }
        }

        counterCCFV = 0

        // Loop through all segments of the kelly wheel.
        for (var i = 0; i < 17; i++) {
            // Setout for the CCFV Images
            // left right | up down | in out
            this.CenterarrayOffset_images = [
                [15,    10, .48], //1
                [0,    20, .48], //2
                [-15,    26, .48], //3
                [-30,     25, .48], //4
                [-40,    16, .48],//5
                [-44,   6, .48],//6
                [-50,   -10, .48],//7
                [-51,   -27, .48],//8
                [-47,   -37, .48],//9    
                [-40, -50, .48],//10
                [-20, -60, .48],//11
                [-10, -55, .48],//12
                [6, -48, .48],//13
                [20, -40, .48],//14
                [28, -28, .48],//15
                [28, -16, .48],//16
                [40, -8, .48]]//17

            // Calculate the lines to split up the kelly wheel.
            cX = (width / 2) + radius * Math.cos(this.arrSegments[i] * Math.PI / 180);
            cY = (height / 2) + radius * Math.sin(this.arrSegments[i] * Math.PI / 180);


            // Set the outer offset
            cXOffset = (width / 2) + radius * Math.cos((this.arrSegments[i]) * Math.PI / 180);
            cYOffset = (height / 2) + radius * Math.sin(this.arrSegments[i] * Math.PI / 180);
          
            // Set the attributes of each line with the line offset
            this.arr[i]
                .attr("x1", '50%')
                .attr("y1", '50%')
                .attr("x2", cX)
                .attr("y2", cY)
                .attr("stroke-width", 3)
                .attr("stroke", "black");

            centerOffset = 0
 
            // Set the CCFV Images
            let img = this.container.append("svg:image")
            .attr("xlink:href",dict[this.virificationArray[i]])
            .attr("x", (.9 + centerOffset) * (cXOffset - (width / 2) + this.CenterarrayOffset_images[counterCCFV][0]) + (width / 2) + this.CenterarrayOffset_images[counterCCFV][0])
            .attr("y", (.9 + centerOffset) * (cYOffset - (height / 2) + this.CenterarrayOffset_images[counterCCFV][1]) + (height / 2) + this.CenterarrayOffset_images[counterCCFV][1]).
            attr("width", 50)
           .attr("height", 50);

            // Loop through each array in the arrDots array which hold each different CCFV type.
            for (var z = 0; z < this.arrDots[i].length; z++) {
        
                

                if(z == 0){
                        // If z == 0 then see the layout calcs for the first kelly wheel slice.
                        // Each list represents the layout of the dots in each kelly wheel slice
                        // //1 is the layout for the first row of CCFV in the first CCFV type
                        this.CenterarrayOffset_dots =
                        // First loop
                        [[23, 4, .06], //1
                        [20, 13, .06], //2
                        [15, 19, .06], //3
                        [4, 22, .06], //4
                        [-3, 23, .06],//5
                        [-11, 20, .06],//6
                        [-18, 16, .06],//7
                        [-22, 6, .06],//8
                        [-22, -1, .06],//9
                        [-20, -9, .06],//10
                        [-14, -16, .06],//11
                        [-9, -20, .06],//12
                        [-1, -20, .06],//13
                        [7, -20, .06],//14
                        [13, -17, .06],//15
                        [18, -11, .06],//16
                        [22, -3, .06]]//17
                        }

                // Loop through the entire data view
                for (var j = 0; j < dataView_.table.rows.length; j++) {

                    // If the virification array type is equal to the data view type, continue on with loop.
                    if (this.virificationArray[i].toString().toUpperCase() == dataView_.table.rows[j][2].toString().toUpperCase()) 
                    {   
                        // Set the offset for the dot, this will space them out as the move along the array.
                        centerOffset = (radius / 800000) + centerOffset + 0.025
                        // Get the string representing the complinace of the sub CCFV type.
                        colourString = dataView_.table.rows[j][1].toString()
                        // If the string is yes, then green else it is non compliant and it is red.
                        if (colourString == "Yes") {
                            colourCCFV = "green"
                        }
                        else {
                            colourCCFV = "red"
                        }
                       
                        // Set the attributes for the dot and location.
                        // Only allow 138 CCFV per section
                        if (z < 138){
                        let dot = this.arrDots[i][z]
                            .style("fill", colourCCFV)
                            .style("stroke", colourCCFV)
                            .style("stroke-width", 2)
                            .attr("r", radiusDot)
                            .attr("cx", (this.CenterarrayOffset_dots[counterCCFV][2] + centerOffset) * (cXOffset - (width / 2) + this.CenterarrayOffset_dots[counterCCFV][0]) + (width / 2) + this.CenterarrayOffset_dots[counterCCFV][0])
                            .attr("cy", (this.CenterarrayOffset_dots[counterCCFV][2] + centerOffset) * (cYOffset - (height / 2) + this.CenterarrayOffset_dots[counterCCFV][1]) + (height / 2) + this.CenterarrayOffset_dots[counterCCFV][1])
                        // Get some data (sub ccfv type) for the tooltip and pass it to the addTooltip method.
                        let tooltipData = dataView_.table.rows[j][3].toString()
                      
                        this.tooltipServiceWrapper.addTooltip(dot,
                               (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipData),
                                (tooltipEvent: TooltipEventArgs<number>) => null
                               )
                        }
                        // Continue on with the loop, when the dots move towards the edge of the circle move to the next arrangement.
                        if (z == 29) {
                           
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [28, 12, .08], //1
                                [20, 22, .08], //2
                                [13, 29, .08], //3
                                [0, 31, .08], //4
                                [-10, 28, .08],//5
                                [-19, 22, .08],//6
                                [-27, 15, .08],//7
                                [-30, 2, .08],//8
                                [-28, -8, .08],//9
                                [-23, -18, .08],//10   2
                                [-15, -25, .08],//11
                                [-7, -28, .08],//12
                                [5, -27, .08],//13
                                [14, -24, .08],//14
                                [22, -19, .08],//15
                                [28, -9, .08],//16
                                [30, 2, .08]]//17
                        }

                        if (z == 58) {
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [28,    19, .18], //1
                                [19,    30, .18], //2
                                [5,    32, .18], //3
                                [-7,     31, .18], //4
                                [-17,    28, .18],//5
                                [-27,   21, .18],//6
                                [-33,   9, .18],//7   3
                                [-34,   -3, .18],//8
                                [-28,   -15, .18],//9
                                [-25, -27, .18],//10
                                [-14, -33, .18],//11
                                [1, -30, .18],//12
                                [11, -27, .18],//13
                                [22, -24, .18],//14
                                [28, -15, .18],//15
                                [32, -3, .18],//16
                                [30, 9, .18]]
                        }

                        if (z == 82) {
                            //-  left right +|- up down +| in out
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [28,    26, .26], //1
                                [17,    37, .26], //2
                                [-2,    36, .26], //3
                                [-14,     32, .26], //4
                                [-25,    28, .26],//5
                                [-35,   20, .26],//6
                                [-39,   5, .26],//7
                                [-39,   -9, .26],//8    4
                                [-28,   -22, .26],//9
                                [-23, -35, .26],//10
                                [-10, -39, .26],//11
                                [7, -34, .26],//12
                                [18, -27, .26],//13
                                [28, -18, .26],//14
                                [34, -10, .26],//15
                                [36, 3, .26],//16
                                [30, 16, .26]]
                        }


                        if (z == 102) {
                            //-  left right +|- up down +| in out
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [19,    33, .39], //1
                                [6,    40, .39], //2
                                [-9,    40, .39], //3
                                [-22,     31, .39], //4
                                [-33,    22, .39],//5
                                [-38,   9, .39],//6
                                [-40,   -5, .39],//7
                                [-32,   -20, .39],//8
                                [-25,   -30, .39],//9
                                [-12, -39, .39],//10
                                [1, -39, .39],//11
                                [16, -33, .39],//12    5
                                [26, -25, .39],//13
                                [34, -16, .39],//14
                                [35, 1, .39],//15
                                [36, 12, .39],//16
                                [30, 24, .39]]
                        }

                        if (z == 120) {
                            //-  left right +|- up down +| in out
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [17,    40, .54], //1
                                [0,    45, .54], //2
                                [-15,    43, .54], //3
                                [-30,     31, .54], //4
                                [-40,    21, .54],//5
                                [-44,   6, .54],//6
                                [-43,   -12, .54],//7
                                [-33,   -27, .54],//8
                                [-25,   -37, .54],//9    6
                                [-10, -45, .54],//10
                                [9, -41, .54],//11
                                [24, -33, .54],//12
                                [33, -25, .54],//13
                                [40, -12, .54],//14
                                [41, 5, .54],//15
                                [36, 20, .54],//16
                                [30, 31, .54]]
                        }


                        
                        if (z == 132) {
                        //-  left right +|- up down +| in out
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [15,    47, .70], //1
                                [-4,    50, .70], //2
                                [-23,    43, .63], //3
                                [-37,     31, .63], //4
                                [-47,    21, .63],//5
                                [-50,   3, .63],//6
                                [-43,   -21, .63],//7    7
                                [-37,   -32, .63],//8
                                [-21,   -44, .63],//9
                                [-4, -50, .63],//10
                                [15, -45, .63],//11
                                [31, -34, .63],//12
                                [40, -24, .63],//13
                                [46, -8, .63],//14
                                [47, 8, .63],//15
                                [35, 28, .63],//16
                                [30, 38, .63]]
                        }

                        if (z == 152) {
                            //-  left right +|- up down +| in out
                            centerOffset = 0
                            this.CenterarrayOffset_dots = [
                                [11,    52, .80], //1
                                [-11,    53, .80], //2
                                [-29,    45, .80], //3
                                [-43,     31, .80], //4
                                [-53,    16, .80],//5
                                [-53,   -5, .80],//6
                                [-47,   -25, .80],//7
                                [-35,   -40, .80],//8
                                [-21,   -50, .80],//9
                                [0, -55, .80],//10    8
                                [18, -50, .80],//11
                                [36, -37, .80],//12
                                [47, -24, .80],//13
                                [52, -6, .80],//14
                                [50, 14, .80],//15
                                [40, 31, .80],//16
                                [30, 44, .80]]
                        }

                        if (z == 140) {
                            centerOffset = 0
                        }
                        // Move to the next z
                        z++
                    }
          
                }
            
                counterCCFV = counterCCFV + 1
            }
            // Raise the lines to the top of the SVG
            this.svg.selectAll("line").raise()
        }
      

    }
}