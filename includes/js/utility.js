var nodeSet = [];
var linkSet = [];
var invisibleNode = [];
var invisibleEdge = [];
var invisibleType = [];
var done = [];
var force;
var focalNodeID = '';

var color = [];
color['Internal Link'] = '#1f77b4';
color['Category'] = '#071f55';
color['URI'] = '#17a8cf';
color['Telephone'] = '#13d1e3';
color['Email'] = '#75d3dd';

color['Number'] = '#2ca02c';
color['Quantity'] = '#114911';
color['Temperature'] = '#b6e75a';

color['Monolingual Text'] = '#f2cd0c';
color['Text'] = '#ff7f0e';
color['Code'] = '##b37845';


color['Boolean'] = '#d62728';
color['Date'] = '#d62790';
color['Record'] = '#8927d6';




window.onload = function() {
    loadWikiArticles();
    loadScript('select2.full.min.js');


    $(function() {
        $('#visualiseSite').click(function() {
            if ($("#wikiArticle").val() === "") {
                //Error Message
                $('#error_msg').show();
            } else {
                $('#error_msg').hide();
                exec($('#wikiArticle').val());
            }
        });
    });
}

function loadScript(name) {
    $.getScript(wgScriptPath + '/extensions/SemanticMediaWikiGraph/includes/js/' + name, function(data, textStatus, jqxhr) {
        console.log(name + " loaded");
    });
}

function exec(wikiArticle) {
    done = [];
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'browsebysubject',
            subject: wikiArticle,
            format: 'json'
        },
        type: 'GET',
        success: function(data) {
            if (data && data.edit && data.edit.result == 'Success') {
                debugger;
            } else if (data && data.error) {
                alert(data);
                debugger;
            } else {
                nodeSet = [];
                linkSet = [];
                done.push(wikiArticle);
                nodeSet.push({
                    id: data.query.subject,
                    name: data.query.subject.split("#")[0].replace("_", " "),
                    type: "Internal Link",
                    fixed: true,
                    x: 10,
                    y: 0,
                    hlink: "./" + data.query.subject.split("#")[0]
                });
                focalNodeID = data.query.subject;
                for (var i = 0; i < data.query.data.length; i++) {

                    var item = data.query.data[i];

                    if (item.property != "_SKEY" && item.property != "_MDAT" && item.property != "_ASK") {
                        if (item.dataitem[0].item == data.query.subject) {
                            item.dataitem[0].item = item.dataitem[0].item + "_" + item.property;
                        }
                        for (var j = 0; j < item.dataitem.length; j++) {
                            var type = getNodeTypeName(item.property, item.dataitem[j].type);
                            if (type == 'Boolean') {
                                if (item.dataitem[j].item == 't') {
                                    item.dataitem[j].item = 'true';
                                } else {
                                    item.dataitem[j].item = 'false';
                                }
                            }
                            if (type == 'URI') {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: item.dataitem[0].item
                                });
                            } else if (type == "Internal Link") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: "./" + item.dataitem[j].item.split("#")[0]
                                });
                            } else if (type == "Date") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.substring(2),
                                    type: type,
                                });
                            } else {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    //hlink: "./" + item.dataitem[0].item
                                });
                            }
                            linkSet.push({
                                sourceId: data.query.subject,
                                linkName: nicePropertyName(item.property),
                                targetId: item.dataitem[j].item
                            });
                        }

                    }

                }
                //backlinks(wikiArticle);
                //und Ask wer hierhin zeigt?
                $('#cluster_chart .chart').empty();
                drawCluster('Drawing1', focalNodeID, nodeSet, linkSet, '#cluster_chart .chart', 'colorScale20');
                var elem = $('[id=' + focalNodeID + '] a');
                elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
            }
        }
    });

}

function getNodeTypeName(name, type) {
    var result = "";
    switch (name) {
        case "_boo":
            result = "Boolean"
            break;
        case "_cod":
            result = "Code";
            break;
        case "_dat":
            result = "Date";
            break;
        case "_ema":
            result = "Email";
            break;
        case "_num":
            result = "Number"; //oder Email //oder Telefon
            break;
        case "_qty":
            result = "Quantity";
            break;
        case "_rec":
            result = "Record";
            break;
        case "_tem":
            result = "Temperature";
            break;
        case "_uri":
            result = "URI";
            break;
        case "_wpg":
            result = "Internal Link";
            break;
        case "Monolingual":
            result = "Monolingual Text";
            break;
        case "Telephone":
            result = "Telephone";
            break;
        case "_TEXT":
            result = "Text";
            break;
        case "_INST":
            result = "Category";
            break;
        default:
            switch (type) {
                case 1:
                    result = "Number";
                    break;
                case 2:
                    result = "Text";
                    break;
                case 4:
                    result = "Boolean";
                    break;
                case 5:
                    result = "URI"; //oder Email //oder Telefon
                    break;
                case 6:
                    result = "Date";
                    break;
                case 9:
                    result = "Internal Link";
                    break;
                default:
                    result = "Unknown Type";
            }
    }


    return result;
}


function nicePropertyName(name) {
    var result = "";
    switch (name) {
        case "_boo":
            result = "Boolean"
            break;
        case "_cod":
            result = "Code";
            break;
        case "_dat":
            result = "Date";
            break;
        case "_ema":
            result = "Email";
            break;
        case "_num":
            result = "Number"; //oder Email //oder Telefon
            break;
        case "_qty":
            result = "Quantity";
            break;
        case "_rec":
            result = "Record";
            break;
        case "_tem":
            result = "Temperature";
            break;
        case "_uri":
            result = "URI";
            break;
        case "_wpg":
            result = "Internal Link";
            break;
        case "Monolingual":
            result = "Monolingual Text";
            break;
        case "Telephone":
            result = "Telephone";
            break;
        case "_TEXT":
            result = "Text";
            break;
        case "_INST":
            result = "isA";
            break;
        default:
            result = name.replace("_", " ");
            break;
    }


    return result;
}


function askNode(wikiArticle) {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'browsebysubject',
            subject: wikiArticle,
            format: 'json'
        },
        type: 'GET',
        success: function(data) {
            if (data && data.edit && data.edit.result == 'Success') {
                debugger;
            } else if (data && data.error) {
                alert(data);
                debugger;
            } else {
                done.push(wikiArticle);

                focalNodeID = data.query.subject;
                nodeSet.forEach(function(item) {
                    if (item.id == focalNodeID) {
                        item.fixed = true;
                    }
                });
                for (var i = 0; i < data.query.data.length; i++) {

                    var item = data.query.data[i];

                    if (item.property.indexOf("_") != 0) {
                        if (item.dataitem[0].item == data.query.subject) {
                            item.dataitem[0].item = item.dataitem[0].item + "_" + item.property;
                        }
                        for (var j = 0; j < item.dataitem.length; j++) {
                            var type = getNodeTypeName(item.property, item.dataitem[j].type);
                            if (type == 'Boolean') {
                                if (item.dataitem[j].item == 't') {
                                    item.dataitem[j].item = 'true';
                                } else {
                                    item.dataitem[j].item = 'false';
                                }
                            }
                            if (type == 'URI') {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: item.dataitem[0].item
                                });
                            } else if (type == "Internal Link") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: "./" + item.dataitem[0].item
                                });
                            } else if (type == "Date") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.substring(2),
                                    type: type,
                                });
                            } else {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    //hlink: "./" + item.dataitem[0].item
                                });
                            }
                            linkSet.push({
                                sourceId: data.query.subject,
                                linkName: nicePropertyName(item.property),
                                targetId: item.dataitem[j].item
                            });
                        }

                    }

                }
                force.stop();
                //  backlinks(wikiArticle);

                $('#cluster_chart .chart').empty();
                //  var k = cloneNode(nodeSet);
                //  var m = cloneEdge(linkSet);
                drawCluster('Drawing1', focalNodeID, nodeSet, linkSet, '#cluster_chart .chart', 'colorScale20');
                //drawCluster.update();
                hideElements();
            }
        }
    });

}


function cloneNode(array) {
    var newArr = [];

    array.forEach(function(item) {
        if (item.hlink !== 'undefined') {
            newArr.push({
                id: item.id,
                name: item.name,
                type: item.type,
                hlink: item.hlink
            });
        } else {
            newArr.push({
                id: item.id,
                name: item.name,
                type: item.type
            });
        }

    });

    return newArr;
}


function backlinks(wikiArticle) {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'query',
            list: 'backlinks',
            bltitle: wikiArticle,
            format: 'json'
        },
        type: 'GET',
        success: function(data) {
            if (data && data.edit && data.edit.result == 'Success') {
                debugger;
            } else if (data && data.error) {
                alert(data);
                debugger;
            } else {
                for (var i = 0; i < data.query.backlinks.length; i++) {

                    var item = data.query.backlinks[i];
                    nodeSet.push({
                        id: item.title,
                        name: item.title,
                        type: 'Unknown',
                        hlink: item.title
                    });

                    linkSet.push({
                        sourceId: item.title,
                        linkName: 'Unknown',
                        targetId: focalNodeID
                    });
                }

            }

            $('#cluster_chart .chart').empty();
            //  var k = cloneNode(nodeSet);
            //  var m = cloneEdge(linkSet);
            drawCluster('Drawing1', focalNodeID, nodeSet, linkSet, '#cluster_chart .chart', 'colorScale20');
            //drawCluster.update();
            hideElements();
        }
    });
}

function cloneEdge(array) {
    var newArr = [];
    array.forEach(function(item) {
        newArr.push({
            sourceId: item.sourceId,
            linkName: item.linkName,
            targetId: item.targetId
        });
    });

    return newArr;
}


function loadWikiArticles() {

    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'query',
            list: 'allpages',
            aplimit: 1000,
            format: 'json'

        },
        type: 'GET',
        success: function(data) {
            if (data && data.edit && data.edit.result == 'Success') {

            } else if (data && data.error) {


            } else {

                var dataArray = data.query.allpages;
                for (var i = 0; i < dataArray.length; i++) {
                    $('#wikiArticle').append('<option value="' + dataArray[i].title + '">' + dataArray[i].title + "</option>");
                }

                $("#wikiArticle").select2({
                    placeholder: "Select a Wiki Article",
                    allowClear: true
                });

            }
        }
    });
}

function colorScaleMW(type) {
    return color[type];
}


function hideElements() {
    var lis = $(".node");
    $(".node").each(function(index, el) {
        var invIndex = invisibleType.indexOf(el.__data__.type);
        if (invIndex > -1) {
            $(this).toggle();
            var invIndexNode = invisibleNode.indexOf(el.__data__.id);
            if (invIndexNode == -1) {
                invisibleNode.push(el.__data__.id);
            }
        }


    });

    $(".gLink").each(function(index, el) {
        //      debugger;
        var valSource = el.__data__.sourceId;
        var valTarget = el.__data__.targetId;
        var indexEdge = invisibleEdge.indexOf(valSource + "_" + valTarget + "_" + el.__data__.linkName);

        var indexSource = invisibleNode.indexOf(valSource);
        var indexTarget = invisibleNode.indexOf(valTarget);
        var indexEdge = invisibleEdge.indexOf(valSource + "_" + valTarget + "_" + el.__data__.linkName);

        if (indexEdge > -1) {
            //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
            $(this).toggle();
            //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
        } else if ((indexSource > -1 || indexTarget > -1)) {
            //Knoten sind nicht unsichtbar, aber Kante ist es
            $(this).toggle();
            invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
        }

    });
}
