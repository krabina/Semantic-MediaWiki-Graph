import d3 from "d3";
import {ColorHelper} from "./ColorHelper";
import {MyClass} from "./app";

export class Utility
{
    public static width = $(".chart")[0].clientWidth;
    public static height = $(".chart")[0].clientHeight;
    public static centerNodeSize = 50;
    public static nodeSize = 10;
    
    public static scale = 1;

    public static this1;
    private static svgCanvas: any;

    public static drawCluster(drawingName: any, focalNode: any, nodeSetApp: any, linkSetApp: any, selectString: any, colors: any): void {
        // drawingName => A unique drawing identifier that has no spaces, no "." and no "#" characters.
        // focalNode => Primary Node of Context.
        // nodeSetApp => Set of nodes and their relevant data.
        // linkSetApp => Set of links and their relevant data.
        // selectString => String that allows you to pass in
        //           a D3 select string.
        // colors => String to set color scale.  Values can be...
        //           => "colorScale10"
        //           => "colorScale20"
        //           => "colorScale20b"
        //           => "colorScale20c"
        // margin => Integer margin offset value.
        // outerRadius => Integer outer radius value.
        // innerRadius => Integer inner radius value.
        // sortArcs => Controls sorting of Arcs by value.
        //              0 = No Sort.  Maintain original order.
        //              1 = Sort by arc value size.

        this.this1 = this;

        const sortedColors = ColorHelper.GetColors(colors, nodeSetApp);

        const svgCanvas = d3.select(selectString)
            .append("svg:svg")
            .call(d3.zoom().on("zoom", () => {
                this.scale = d3.event.transform.k;
                svgCanvas.attr("transform", d3.event.transform);
            }))
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("id", "svgCanvas")
            .append("svg:g")
            .attr("class", "focalNodeCanvas");


        const node_hash = [];
        const type_hash = [];

        // Create a hash that allows access to each node by its id
        nodeSetApp.forEach((d: any, i: any) => {
            node_hash[d.id] = d;
            type_hash[d.type] = d.type;
        });

        // Append the source object node and the target object node to each link records...
        linkSetApp.forEach((d: any, i: any) => {
            d.source = node_hash[d.sourceId];
            d.target = node_hash[d.targetId];
            d.direction = d.sourceId === MyClass.focalNodeID ? "OUT" : "IN";
        });

        // Create a force layout and bind Nodes and Links
        var force = d3.forceSimulation()
            .nodes(nodeSetApp)
            // .links(linkSetApp)
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("gravity", d3.forceManyBody().strength(.01))
            .force("friction", d3.forceManyBody().strength(.2))
            // .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1)) => d.id).strength(9))
            // .force("link", d3.forceLink().id((d: any) => d.id).distance((d) => width < height ? width * 1 / 3 : height * 1 / 3))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .on("tick", () => {
                tick();
            })
        // .start();


        // Draw lines for Links between Nodes
        const link = svgCanvas.selectAll(".gLink")
            // .data(force.links())
            .enter().append("g")
            .attr("class", "gLink")
            //    .attr("class", "link")
            .attr("endNode", (d: CustomDto, i) => d.targetId)
            .attr("startNode", (d: CustomDto, i) => d.sourceId)
            .attr("targetType", (d: any, i) => d.target.type)
            .attr("sourceType", (d: any, i) => d.source.type)
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", "1.5px")
            .attr("marker-end", (d, i) => `url(#arrow_${i})`)
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);
        let clickText = false;
        // Create Nodes
        const node = svgCanvas.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .attr("id", (d: any) => d.id)
            .attr("type_value", (d: any, i) => d.type)
            .attr("color_value", (d: any, i) => ColorHelper.color_hash[d.type])
            .attr("xlink:href", (d: any) => d.hlink)
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            .on("mouseover", this.nodeMouseOver)
            .on("click", this.mouseClickNode)
            .on("mouseout", this.nodeMouseOut)
            // .call(force.drag)
            .append("a");

        // Append circles to Nodes
        node.append("circle")
            //.attr("x", function(d) { return d.x; })
            //.attr("y", function(d) { return d.y; })
            .attr("r", (d: any) => d.id === MyClass.focalNodeID ? this.centerNodeSize : this.nodeSize)
            .style("fill", "White") // Make the nodes hollow looking
            //.style("fill", "transparent")
            .attr("type_value", (d: any, i) => d.type)
            .attr("color_value", (d: any, i) => ColorHelper.color_hash[d.type])
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            //.attr("x", function(d) { if (d.id==focalNodeID) { return width/2; } else { return d.x; } })
            //.attr("y", function(d) { if (d.id==focalNodeID) { return height/2; } else { return d.y; } })
            .attr("class", (d: any, i) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeCircle-" + strippedString; })
                return d.id === MyClass.focalNodeID ? "focalNodeCircle" : `nodeCircle-${strippedString}`;
            })
            .style("stroke-width", 5) // Give the node strokes some thickness
            .style("stroke", (d: any, i) => ColorHelper.color_hash[d.type]) // Node stroke colors
        // .call(force.drag);

        // Append text to Nodes
        node.append("text")
            .attr("x", (d: any) => d.id === MyClass.focalNodeID ? 0 : 20)
            .attr("y", (d: any) => {
                return d.id === MyClass.focalNodeID ? 0 : -10;
            })
            .attr("text-anchor", (d: any) => d.id === MyClass.focalNodeID ? "middle" : "start")
            .on("click", this.mouseClickNodeText)
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue")
            .style("fill", (d: any, i) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any, i) => d.type)
            .attr("color_value", (d: any, i) => ColorHelper.color_hash[d.type])
            .attr("class", (d: any, i) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeText-" + strippedString; })
                return d.id === MyClass.focalNodeID ? "focalNodeText" : `nodeText-${strippedString}`;
            })
            .attr("dy", ".35em")
            .text((d: any) => d.name);

        // Append text to Link edges
        const linkText = svgCanvas.selectAll(".gLink")
            // .data(force.links())
            .append("text")
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .attr("x", (d: any) => d.target.x > d.source.x ? (d.source.x + (d.target.x - d.source.x) / 2) : (d.target.x + (d.source.x - d.target.x) / 2))
            .attr("y", (d: any) => d.target.y > d.source.y ? (d.source.y + (d.target.y - d.source.y) / 2) : (d.target.y + (d.source.y - d.target.y) / 2))
            .attr("fill", "Black")
            .style("font", "normal 12px Arial")
            .attr("dy", ".35em")
            .text((d: any) => d.linkName);


        const tick = function () {
            link.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("cx", (d: any) => {
                if (d.id === MyClass.focalNodeID) {
                    const s = 1 / this.scale;
                    return d.x = Math.max(60, Math.min(s * ($(".chart")[0].clientWidth - 60), d.x));
                } else {
                    const s = 1 / this.scale;
                    return d.x = Math.max(20, Math.min(s * ($(".chart")[0].clientWidth - 20), d.x));
                }


            })
                .attr("cy", (d: any) => {
                    if (d.id === MyClass.focalNodeID
                    ) {
                        const s = 1 / this.scale;
                        return d.y = Math.max(60, Math.min(s * ($(".chart")[0].clientHeight - 60), d.y));
                    } else {
                        const s = 1 / this.scale;
                        return d.y = Math.max(20, Math.min(s * ($(".chart")[0].clientHeight - 20), d.y));
                    }
                });

            link.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

            linkText
                .attr("x", (d: any) => d.target.x > d.source.x ? (d.source.x + (d.target.x - d.source.x) / 2) : (d.target.x + (d.source.x - d.target.x) / 2))
                .attr("y", (d: any) => d.target.y > d.source.y ? (d.source.y + (d.target.y - d.source.y) / 2) : (d.target.y + (d.source.y - d.target.y) / 2));
        }


        // Print Legend Title...
        svgCanvas.append("text").attr("class", "region")
            .text("Color Keys for Data Types...")
            .attr("x", 15)
            .attr("y", 25)
            .style("fill", "Black")
            .style("font", "bold 16px Arial")
            .attr("text-anchor", "start");


        //Build the Arrows
        svgCanvas.selectAll(".gLink").append("marker")
            .attr("id", (d: any, i) => `arrow_${i}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", (d: any, i) =>
                d.targetId === MyClass.focalNodeID ? 55 : 20
            )
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
        // Plot the bullet circles...
        svgCanvas.selectAll("focalNodeCanvas")
            .data(sortedColors).enter().append("svg:circle") // Append circle elements
            .attr("cx", 20)
            .attr("cy", (d: any, i) => (45 + (i * 20)))
            .attr("stroke-width", ".5")
            .style("fill", (d: any, i) => ColorHelper.color_hash[d])
            .attr("r", 6)
            .attr("color_value", (d: any, i) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any, i) => d)
            .attr("index_value", (d: any, i) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendBullet-${strippedString}`;
            })
            .on('mouseover', this.typeMouseOver)
            .on("mouseout", this.typeMouseOut)
            .on('click', this.clickLegend);

        // Create legend text that acts as label keys...
        svgCanvas.selectAll("a.legend_link")
            .data(sortedColors) // Instruct to bind dataSet to text elements
            .enter().append("svg:a") // Append legend elements
            .append("text")
            .attr("text-anchor", "center")
            .attr("x", 40)
            .attr("y", (d: any, i) => (45 + (i * 20)))
            .attr("dx", 0)
            .attr("dy", "4px") // Controls padding to place text in alignment with bullets
            .text((d: any) => d)
            .attr("color_value", (d: any, i) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any, i) => d)
            .attr("index_value", (d: any, i) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendText-${strippedString}`;
            })
            .style("fill", "Black")
            .style("font", "normal 14px Arial")
            .on('mouseover', this.typeMouseOver)
            .on("mouseout", this.typeMouseOut);



        d3.select(window).on('resize.updatesvg', this.updateWindow);
    }

    public static updateWindow() {
        this.width = $(".chart")[0].clientWidth - 60;
        this.height = $(".chart")[0].clientHeight - 60;

        this.svgCanvas.attr("width", this.width).attr("height", this.height);
        $('#svgCanvas').width(this.width + 90);
        $('#svgCanvas').height(this.height + 60);
    }
    

    public static clickLegend() {

        let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue: string = thisObject.attr("type_value");

        //    var selectedBullet = d3.selectAll(legendBulletSelector);
        //  selectedBullet.style("fill", "none");
        //    selectedBullet.style("stroke", colorValue);
        //    selectedBullet.style("stroke-width", "3");
        //  debugger;
        //      $(".node [type_value='" + typeValue + "']").toggle();
        //  [type_value='" + typeValue + "']")
        //      var lis = $(".node");
        let invisibleType = [];
        const invIndexType = invisibleType.indexOf(typeValue);
        if (invIndexType > -1) {
            invisibleType.splice(Number(typeValue), 1);
        } else {
            invisibleType.push(typeValue);
        }
        $(".node").each(function (index, el: CustomHTMLElement) {
            if (el.__data__.type !== typeValue) {
                return;
            }
            const invIndex = MyClass.invisibleNode.indexOf(el.__data__.id);
            if (invIndex > -1) {
                MyClass.invisibleNode.splice(invIndex, 1);
            } else {
                MyClass.invisibleNode.push(el.__data__.id);
            }
            $(this).toggle();

        });

        $(".gLink").each(function (index, el: CustomHTMLElement) {
            //      debugger;
            const valSource = el.__data__.sourceId;
            const valTarget = el.__data__.targetId;
            //if beide
            const indexSource = MyClass.invisibleNode.indexOf(valSource);
            const indexTarget = MyClass.invisibleNode.indexOf(valTarget);
            const indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

            if ((indexSource > -1 || indexTarget > -1) && indexEdge === -1) {
                //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
                $(this).toggle();
                MyClass.invisibleEdge.push(`${valSource}_${valTarget}_${el.__data__.linkName}`);
            } else if (indexSource === -1 && indexTarget === -1 && indexEdge === -1) {
                //Beide Knoten sind nicht unsichtbar und Kante ist nicht unsichtbar
            } else if (indexSource === -1 && indexTarget === -1 && indexEdge > -1) {
                //Knoten sind nicht unsichtbar, aber Kante ist es
                $(this).toggle();
                MyClass.invisibleEdge.splice(indexEdge, 1);
            }
        });
    };

    public static typeMouseOver (nodeSize) {
        let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        const legendBulletSelector = `.legendBullet-${strippedTypeValue}`;
        const selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", "Maroon");
        selectedBullet.attr("r", 1.2 * 6);

        const legendTextSelector = `.legendText-${strippedTypeValue}`;
        const selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "bold 14px Arial");
        selectedLegendText.style("fill", "Maroon");

        const nodeTextSelector = `.nodeText-${strippedTypeValue}`;
        const selectedNodeText = d3.selectAll(nodeTextSelector);
        //document.writeln(pie3SliceSelector);
        selectedNodeText.style("font", "bold 16px Arial");
        selectedNodeText.style("fill", "Maroon");

        const nodeCircleSelector = `.nodeCircle-${strippedTypeValue}`;
        const selectedCircle = d3.selectAll(nodeCircleSelector);
        //document.writeln(nodeCircleSelector);
        selectedCircle.style("fill", "Maroon");
        selectedCircle.style("stroke", "Maroon");
        selectedCircle.attr("r", 1.2 * nodeSize);

        const focalNodeCircleSelector = ".focalNodeCircle";
        const selectedFocalNodeCircle = d3.selectAll(focalNodeCircleSelector);
        //document.writeln(focalNodeCircleSelector);
        const focalNodeType = selectedFocalNodeCircle.attr("type_value");
        if (typeValue === focalNodeType) {
            selectedFocalNodeCircle.style("stroke", "Maroon");
            selectedFocalNodeCircle.style("fill", "White");
        }

        const focalNodeTextSelector = ".focalNodeText";
        const selectedFocalNodeText = d3.selectAll(focalNodeTextSelector);
        const focalNodeTextType = selectedFocalNodeText.attr("type_value");
        //document.writeln(pie3SliceSelector);
        if (typeValue === focalNodeTextType) {
            selectedFocalNodeText.style("fill", "Maroon");
            selectedFocalNodeText.style("font", "bold 16px Arial");
        }
    };

    public static typeMouseOut(selector: string, nodeSize)
    {
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const colorValue = thisObject.attr("color_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        const legendBulletSelector = `.legendBullet-${strippedTypeValue}`;
        const selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", 6);

        const legendTextSelector = `.legendText-${strippedTypeValue}`;
        const selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "normal 14px Arial");
        selectedLegendText.style("fill", "Black");

        const nodeTextSelector = `.nodeText-${strippedTypeValue}`;
        const selectedNodeText = d3.selectAll(nodeTextSelector);
        //document.writeln(pie3SliceSelector);
        selectedNodeText.style("font", "normal 16px Arial");
        selectedNodeText.style("fill", "Blue");

        const nodeCircleSelector = `.nodeCircle-${strippedTypeValue}`;
        const selectedCircle = d3.selectAll(nodeCircleSelector);
        //document.writeln(nodeCircleSelector);
        selectedCircle.style("fill", "White");
        selectedCircle.style("stroke", colorValue);
        selectedCircle.attr("r", nodeSize);

        const focalNodeCircleSelector = ".focalNodeCircle";
        const selectedFocalNodeCircle = d3.selectAll(focalNodeCircleSelector);
        //document.writeln(focalNodeCircleSelector);
        const focalNodeType = selectedFocalNodeCircle.attr("type_value");
        if (typeValue === focalNodeType) {
            selectedFocalNodeCircle.style("stroke", colorValue);
            selectedFocalNodeCircle.style("fill", "White");
        }

        const focalNodeTextSelector = ".focalNodeText";
        const selectedFocalNodeText = d3.selectAll(focalNodeTextSelector);
        //document.writeln(pie3SliceSelector);
        selectedFocalNodeText.style("fill", "Blue");
        selectedFocalNodeText.style("font", "normal 14px Arial");
    };

    public static mouseClickNode (clickText) {
        let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");

        if (!clickText && typeValue === 'Internal Link') {
            const n = thisObject[0][0].__data__.name;
            if (!MyClass.done.includes(n)) {
                MyClass.askNode(n);
            }
        }

        clickText = false;
    };

    public static mouseClickNodeText(clickText)
    {
        let selector = this.this1;
        let win: any;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");

        if (typeValue === 'Internal Link') {
            //    var win = window.open("index.php/" + thisObject[0][0].__data__.hlink);
            let win = window.open(thisObject[0][0].__data__.hlink);
        } else if (typeValue === 'URI') {
            let win = window.open(thisObject[0][0].__data__.hlink);
        }

        clickText = true;
    };


    public static nodeMouseOver( ) {
        let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        d3.select(selector).select("circle").transition()
            .duration(250)
            .attr("r", (d: any, i) => d.id === MyClass.focalNodeID ? 65 : 15);
        d3.select(selector).select("text").transition()
            .duration(250)
            .style("font", "bold 20px Arial")
            .attr("fill", "Blue");

        const legendBulletSelector = `.legendBullet-${strippedTypeValue}`;
        const selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", "Maroon");
        selectedBullet.attr("r", 1.2 * 6);

        const legendTextSelector = `.legendText-${strippedTypeValue}`;
        const selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "bold 14px Arial");
        selectedLegendText.style("fill", "Maroon");

    };

    public static nodeMouseOut () {
        let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const colorValue = thisObject.attr("color_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        d3.select(selector).select("circle").transition()
            .duration(250)
            .attr("r", (d: { id: string; }, i: any) => d.id === MyClass.focalNodeID ? this.centerNodeSize : this.nodeSize);
        d3.select(selector).select("text").transition()
            .duration(250)
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue");

        const legendBulletSelector = `.legendBullet-${strippedTypeValue}`;
        const selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", 6);

        const legendTextSelector = `.legendText-${strippedTypeValue}`;
        const selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "normal 14px Arial");
        selectedLegendText.style("fill", "Black");
    };
}