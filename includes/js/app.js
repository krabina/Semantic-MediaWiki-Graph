function drawCluster(drawingName, focalNode, nodeSetApp, linkSetApp, selectString, colors) {

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

    // Color Scale Handling...
    var colorScale = d3.scale.category20c();
    switch (colors) {
        case "colorScale10":
            colorScale = d3.scale.category10();
            break;
        case "colorScale20":
            colorScale = d3.scale.category20();
            break;
        case "colorScale20b":
            colorScale = d3.scale.category20b();
            break;
        case "colorScale20c":
            colorScale = d3.scale.category20c();
            break;
        default:
            colorScale = d3.scale.category20c();
    };

    var width = $(".chart")[0].clientWidth;
    var height = $(".chart")[0].clientHeight;
    var centerNodeSize = 50;
    var nodeSize = 10;
    var color_hash = [];
    var scale = 1;

    var clickLegend = function() {

        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");
        var colorValue = thisObject.attr("color_value");
        var k = d3.selectAll(".node [type_value='" + typeValue + "']");

        var legendBulletSelector = "." + "legendBullet-" + strippedTypeValue;
        //    var selectedBullet = d3.selectAll(legendBulletSelector);
        //  selectedBullet.style("fill", "none");
        //    selectedBullet.style("stroke", colorValue);
        //    selectedBullet.style("stroke-width", "3");
        //  debugger;
        //      $(".node [type_value='" + typeValue + "']").toggle();
        //  [type_value='" + typeValue + "']")
        //      var lis = $(".node");
        var invIndexType = invisibleType.indexOf(typeValue);
        if (invIndexType > -1) {
            invisibleType.splice(typeValue, 1);
        } else {
            invisibleType.push(typeValue);
        }
        $(".node").each(function(index, el) {
            if (el.__data__.type == typeValue) {
                var invIndex = invisibleNode.indexOf(el.__data__.id);
                if (invIndex > -1) {
                    invisibleNode.splice(invIndex, 1);
                } else {
                    invisibleNode.push(el.__data__.id);
                }
                $(this).toggle();
            }

        });

        $(".gLink").each(function(index, el) {
            //      debugger;
            var valSource = el.__data__.sourceId;
            var valTarget = el.__data__.targetId;
            //if beide
            var indexSource = invisibleNode.indexOf(valSource);
            var indexTarget = invisibleNode.indexOf(valTarget);
            var indexEdge = invisibleEdge.indexOf(valSource + "_" + valTarget + "_" + el.__data__.linkName);

            if ((indexSource > -1 || indexTarget > -1) && indexEdge == -1) {
                //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
                $(this).toggle();
                invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
            } else if (indexSource == -1 && indexTarget == -1 && indexEdge == -1) {
                //Beide Knoten sind nicht unsichtbar und Kante ist nicht unsichtbar
            } else if (indexSource == -1 && indexTarget == -1 && indexEdge > -1) {
                //Knoten sind nicht unsichtbar, aber Kante ist es
                $(this).toggle();
                invisibleEdge.splice(indexEdge, 1);
            }

        });

    };

    var typeMouseOver = function() {

        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");

        var legendBulletSelector = "." + "legendBullet-" + strippedTypeValue;
        var selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", "Maroon");
        selectedBullet.attr("r", 1.2 * 6);

        var legendTextSelector = "." + "legendText-" + strippedTypeValue;
        var selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "bold 14px Arial")
        selectedLegendText.style("fill", "Maroon");

        var nodeTextSelector = "." + "nodeText-" + strippedTypeValue;
        var selectedNodeText = d3.selectAll(nodeTextSelector);
        //document.writeln(pie3SliceSelector);
        selectedNodeText.style("font", "bold 16px Arial")
        selectedNodeText.style("fill", "Maroon");

        var nodeCircleSelector = "." + "nodeCircle-" + strippedTypeValue;
        var selectedCircle = d3.selectAll(nodeCircleSelector);
        //document.writeln(nodeCircleSelector);
        selectedCircle.style("fill", "Maroon");
        selectedCircle.style("stroke", "Maroon");
        selectedCircle.attr("r", 1.2 * nodeSize);

        var focalNodeCircleSelector = "." + "focalNodeCircle";
        var selectedFocalNodeCircle = d3.selectAll(focalNodeCircleSelector);
        //document.writeln(focalNodeCircleSelector);
        var focalNodeType = selectedFocalNodeCircle.attr("type_value");
        if (typeValue == focalNodeType) {
            selectedFocalNodeCircle.style("stroke", "Maroon");
            selectedFocalNodeCircle.style("fill", "White");
        };

        var focalNodeTextSelector = "." + "focalNodeText";
        var selectedFocalNodeText = d3.selectAll(focalNodeTextSelector);
        var focalNodeTextType = selectedFocalNodeText.attr("type_value");
        //document.writeln(pie3SliceSelector);
        if (typeValue == focalNodeTextType) {
            selectedFocalNodeText.style("fill", "Maroon");
            selectedFocalNodeText.style("font", "bold 16px Arial")
        };

    };

    var typeMouseOut = function() {

        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");
        var colorValue = thisObject.attr("color_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");

        var legendBulletSelector = "." + "legendBullet-" + strippedTypeValue;
        var selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", 6);

        var legendTextSelector = "." + "legendText-" + strippedTypeValue;
        var selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "normal 14px Arial")
        selectedLegendText.style("fill", "Black");

        var nodeTextSelector = "." + "nodeText-" + strippedTypeValue;
        var selectedNodeText = d3.selectAll(nodeTextSelector);
        //document.writeln(pie3SliceSelector);
        selectedNodeText.style("font", "normal 16px Arial")
        selectedNodeText.style("fill", "Blue");

        var nodeCircleSelector = "." + "nodeCircle-" + strippedTypeValue;
        var selectedCircle = d3.selectAll(nodeCircleSelector);
        //document.writeln(nodeCircleSelector);
        selectedCircle.style("fill", "White");
        selectedCircle.style("stroke", colorValue);
        selectedCircle.attr("r", nodeSize);

        var focalNodeCircleSelector = "." + "focalNodeCircle";
        var selectedFocalNodeCircle = d3.selectAll(focalNodeCircleSelector);
        //document.writeln(focalNodeCircleSelector);
        var focalNodeType = selectedFocalNodeCircle.attr("type_value");
        if (typeValue == focalNodeType) {
            selectedFocalNodeCircle.style("stroke", colorValue);
            selectedFocalNodeCircle.style("fill", "White");
        };

        var focalNodeTextSelector = "." + "focalNodeText";
        var selectedFocalNodeText = d3.selectAll(focalNodeTextSelector);
        //document.writeln(pie3SliceSelector);
        selectedFocalNodeText.style("fill", "Blue");
        selectedFocalNodeText.style("font", "normal 14px Arial")

    };


    var mouseClickNode = function() {
        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");

        if (!clickText && typeValue == 'Internal Link') {
            var n = thisObject[0][0].__data__.name;
            if (done.indexOf(n) == -1) {
                askNode(n);
            }

        }

        clickText = false;

    }

    var mouseClickNodeText = function() {

        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");

        if (typeValue == 'Internal Link') {
        //    var win = window.open("index.php/" + thisObject[0][0].__data__.hlink);
            var win = window.open(thisObject[0][0].__data__.hlink);
        } else if (typeValue == 'URI') {
            var win = window.open(thisObject[0][0].__data__.hlink);
        }

        clickText = true;
    }


    var nodeMouseOver = function() {

        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");
        var colorValue = thisObject.attr("color_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");

        d3.select(this).select("circle").transition()
            .duration(250)
            .attr("r", function(d, i) {
                if (d.id == focalNodeID) {
                    return 65;
                } else {
                    return 15;
                }
            });
        d3.select(this).select("text").transition()
            .duration(250)
            .style("font", "bold 20px Arial")
            .attr("fill", "Blue");

        var legendBulletSelector = "." + "legendBullet-" + strippedTypeValue;
        var selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", "Maroon");
        selectedBullet.attr("r", 1.2 * 6);

        var legendTextSelector = "." + "legendText-" + strippedTypeValue;
        var selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "bold 14px Arial")
        selectedLegendText.style("fill", "Maroon");

    }

    var nodeMouseOut = function() {

        var thisObject = d3.select(this);
        var typeValue = thisObject.attr("type_value");
        var colorValue = thisObject.attr("color_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");

        d3.select(this).select("circle").transition()
            .duration(250)
            .attr("r", function(d, i) {
                if (d.id == focalNodeID) {
                    return centerNodeSize;
                } else {
                    return nodeSize;
                }
            });
        d3.select(this).select("text").transition()
            .duration(250)
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue");

        var legendBulletSelector = "." + "legendBullet-" + strippedTypeValue;
        var selectedBullet = d3.selectAll(legendBulletSelector);
        //document.writeln(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", 6);

        var legendTextSelector = "." + "legendText-" + strippedTypeValue;
        var selectedLegendText = d3.selectAll(legendTextSelector);
        //document.writeln(legendBulletSelector);
        selectedLegendText.style("font", "normal 14px Arial")
        selectedLegendText.style("fill", "Black");

    }

    // Create a hash that maps colors to types...
    nodeSetApp.forEach(function(d, i) {
        color_hash[d.type] = d.type;
        //document.writeln(color_hash[d.type]);
    });

    function keys(obj) {
        var keys = [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    var sortedKeys = keys(color_hash).sort();

    sortedKeys.forEach(function(d, i) {
        color_hash[d] = colorScaleMW(d);
        //document.writeln(color_hash[d]);
    });

    // Add colors to original node records...
    nodeSetApp.forEach(function(d, i) {
        d.color = color_hash[d.type];
        //document.writeln(d.type);
    });

    // Create a canvas...
    var svgCanvas = d3.select(selectString)
        .append("svg:svg")
        .call(d3.behavior.zoom().on("zoom", function() {
            scale = d3.event.scale;
            svgCanvas.attr("transform", " scale(" + d3.event.scale + ")");
        }))
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svgCanvas")
        .append("svg:g")
        .attr("class", "focalNodeCanvas")

    var node_hash = [];
    var type_hash = [];

    // Create a hash that allows access to each node by its id
    nodeSetApp.forEach(function(d, i) {
        node_hash[d.id] = d;
        type_hash[d.type] = d.type;
    });

    // Append the source object node and the target object node to each link records...
    linkSetApp.forEach(function(d, i) {
        d.source = node_hash[d.sourceId];
        d.target = node_hash[d.targetId];
        if (d.sourceId == focalNodeID) {
            d.direction = "OUT";
        } else {
            d.direction = "IN";
        }
    });

    // Create a force layout and bind Nodes and Links
    force = d3.layout.force()
        .nodes(nodeSetApp)
        .links(linkSetApp)
        .charge(-1000)
        .gravity(.01)
        .friction(.2)
        .linkStrength(9)
        //.size([width/8, height/10])
        .linkDistance(function(d) {
            if (width < height) {
                return width * 1 / 3;
            } else {
                return height * 1 / 3
            }
        }) // Controls edge length
        .size([width, height])
        .on("tick", tick)
        .start();

    // Draw lines for Links between Nodes
    var link = svgCanvas.selectAll(".gLink")
        .data(force.links())
        .enter().append("g")
        .attr("class", "gLink")
        //    .attr("class", "link")
        .attr("endNode", function(d, i) {
            return d.targetId;
        })
        .attr("startNode", function(d, i) {
            return d.sourceId;
        })
        .attr("targetType", function(d, i) {
            return d.target.type;
        })
        .attr("sourceType", function(d, i) {
            return d.source.type;
        })
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", "1.5px")
        .attr("marker-end", function(d, i) {
            return "url(#arrow_" + i + ")"
        })
        .attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });
    var clickText = false;
    // Create Nodes
    var node = svgCanvas.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .attr("id", function(d) {
            return d.id;
        })
        .attr("type_value", function(d, i) {
            return d.type;
        })
        .attr("color_value", function(d, i) {
            return color_hash[d.type];
        })
        .attr("xlink:href", function(d) {
            return d.hlink;
        })
        //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
        .on("mouseover", nodeMouseOver)
        .on("click", mouseClickNode)
        .on("mouseout", nodeMouseOut)
        .call(force.drag)
        .append("a");

    // Append circles to Nodes
    node.append("circle")
        //.attr("x", function(d) { return d.x; })
        //.attr("y", function(d) { return d.y; })
        .attr("r", function(d) {
            if (d.id == focalNodeID) {
                return centerNodeSize;
            } else {
                return nodeSize;
            }
        })
        .style("fill", "White") // Make the nodes hollow looking
        //.style("fill", "transparent")
        .attr("type_value", function(d, i) {
            return d.type;
        })
        .attr("color_value", function(d, i) {
            return color_hash[d.type];
        })
        //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
        //.attr("x", function(d) { if (d.id==focalNodeID) { return width/2; } else { return d.x; } })
        //.attr("y", function(d) { if (d.id==focalNodeID) { return height/2; } else { return d.y; } })
        .attr("class", function(d, i) {
            var str = d.type;
            var strippedString = str.replace(/ /g, "_")
                //return "nodeCircle-" + strippedString; })
            if (d.id == focalNodeID) {
                return "focalNodeCircle";
            } else {
                return "nodeCircle-" + strippedString;
            }
        })
        .style("stroke-width", 5) // Give the node strokes some thickness
        .style("stroke", function(d, i) {
            return color_hash[d.type];
        }) // Node stroke colors
        .call(force.drag);

    // Append text to Nodes
    node.append("text")
        .attr("x", function(d) {
            if (d.id == focalNodeID) {
                return 0;
            } else {
                return 20;
            }
        })
        .attr("y", function(d) {
            if (d.id == focalNodeID) {
                return 0;
            } else {
                return -10;
            }
        })
        .attr("text-anchor", function(d) {
            if (d.id == focalNodeID) {
                return "middle";
            } else {
                return "start";
            }
        })
        .on("click", mouseClickNodeText)
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .style("font", "normal 16px Arial")
        .attr("fill", "Blue")
        .style("fill", function(d, i) {
            return color_hash[d];
        })
        .attr("type_value", function(d, i) {
            return d.type;
        })
        .attr("color_value", function(d, i) {
            return color_hash[d.type];
        })
        .attr("class", function(d, i) {
            var str = d.type;
            var strippedString = str.replace(/ /g, "_");
            //return "nodeText-" + strippedString; })
            if (d.id == focalNodeID) {
                return "focalNodeText";
            } else {
                return "nodeText-" + strippedString;
            }
        })
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name;
        });

    // Append text to Link edges
    var linkText = svgCanvas.selectAll(".gLink")
        .data(force.links())
        .append("text")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("x", function(d) {
            if (d.target.x > d.source.x) {
                return (d.source.x + (d.target.x - d.source.x) / 2);
            } else {
                return (d.target.x + (d.source.x - d.target.x) / 2);
            }
        })
        .attr("y", function(d) {
            if (d.target.y > d.source.y) {
                return (d.source.y + (d.target.y - d.source.y) / 2);
            } else {
                return (d.target.y + (d.source.y - d.target.y) / 2);
            }
        })
        .attr("fill", "Black")
        .style("font", "normal 12px Arial")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.linkName;
        });


    function tick() {
        link
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node.attr("cx", function(d) {
                if (d.id == focalNodeID) {
                    var s = 1 / scale;
                    return d.x = Math.max(0 + 60, Math.min(s * ($(".chart")[0].clientWidth - 60), d.x));
                } else {
                    var s = 1 / scale;
                    return d.x = Math.max(0 + 20, Math.min(s * ($(".chart")[0].clientWidth - 20), d.x));
                }


            })
            .attr("cy", function(d) {
                if (d.id == focalNodeID) {
                    var s = 1 / scale;
                    return d.y = Math.max(0 + 60, Math.min(s * ($(".chart")[0].clientHeight - 60), d.y));
                } else {
                    var s = 1 / scale;
                    return d.y = Math.max(0 + 20, Math.min(s * ($(".chart")[0].clientHeight - 20), d.y));
                }
            });

        link.attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        linkText
            .attr("x", function(d) {
                if (d.target.x > d.source.x) {
                    return (d.source.x + (d.target.x - d.source.x) / 2);
                } else {
                    return (d.target.x + (d.source.x - d.target.x) / 2);
                }
            })
            .attr("y", function(d) {
                if (d.target.y > d.source.y) {
                    return (d.source.y + (d.target.y - d.source.y) / 2);
                } else {
                    return (d.target.y + (d.source.y - d.target.y) / 2);
                }
            });
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
        .attr("id", function(d, i) {
            //  debugger;
            return "arrow_" + i;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", function(d, i) {
            //  debugger;
            if (d.targetId == focalNodeID) {
                return 55;
            } else {
                return 20;
            }

        })
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
    // Plot the bullet circles...
    svgCanvas.selectAll("focalNodeCanvas")
        .data(sortedKeys).enter().append("svg:circle") // Append circle elements
        .attr("cx", 20)
        .attr("cy", function(d, i) {
            return (45 + (i * 20));
        })
        .attr("stroke-width", ".5")
        .style("fill", function(d, i) {
            return color_hash[d];
        })
        .attr("r", 6)
        .attr("color_value", function(d, i) {
            return color_hash[d];
        })
        .attr("type_value", function(d, i) {
            return d;
        })
        .attr("index_value", function(d, i) {
            return "index-" + i;
        })
        .attr("class", function(d) {
            var str = d;
            var strippedString = str.replace(/ /g, "_")
            return "legendBullet-" + strippedString;
        })
        .on('mouseover', typeMouseOver)
        .on("mouseout", typeMouseOut)
        .on('click', clickLegend);

    // Create legend text that acts as label keys...
    svgCanvas.selectAll("a.legend_link")
        .data(sortedKeys) // Instruct to bind dataSet to text elements
        .enter().append("svg:a") // Append legend elements
        .append("text")
        .attr("text-anchor", "center")
        .attr("x", 40)
        .attr("y", function(d, i) {
            return (45 + (i * 20));
        })
        .attr("dx", 0)
        .attr("dy", "4px") // Controls padding to place text in alignment with bullets
        .text(function(d) {
            return d;
        })
        .attr("color_value", function(d, i) {
            return color_hash[d];
        })
        .attr("type_value", function(d, i) {
            return d;
        })
        .attr("index_value", function(d, i) {
            return "index-" + i;
        })
        .attr("class", function(d) {
            var str = d;
            var strippedString = str.replace(/ /g, "_")
            return "legendText-" + strippedString;
        })
        .style("fill", "Black")
        .style("font", "normal 14px Arial")
        .on('mouseover', typeMouseOver)
        .on("mouseout", typeMouseOut);


    function updateWindow() {
        width = $(".chart")[0].clientWidth - 60
        height = $(".chart")[0].clientHeight - 60

        svgCanvas.attr("width", width).attr("height", height);
        $('#svgCanvas').width(width + 90);
        $('#svgCanvas').height(height + 60);
    }
    d3.select(window).on('resize.updatesvg', updateWindow);

};
