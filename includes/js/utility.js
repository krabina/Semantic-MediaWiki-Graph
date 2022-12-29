
let nodeSet = [];
let linkSet = [];
const invisibleNode = [];
const invisibleEdge = [];
const invisibleType = [];
let done = [];
let force;
let focalNodeID = '';
const color = [];
color['Internal Link'] = '#1f77b4';
color.Category = '#071f55';
color.URI = '#17a8cf';
color.Telephone = '#13d1e3';
color.Email = '#75d3dd';

color.Number = '#2ca02c';
color.Quantity = '#114911';
color.Temperature = '#b6e75a';

color['Monolingual Text'] = '#f2cd0c';
color.Text = '#ff7f0e';
color.Code = '#b37845';


color.Boolean = '#d62728';
color.Date = '#d62790';
color.Record = '#8927d6';

// $("#wikiArticle").ready(() => { loadWikiArticles(); });

$(document).ready(() => {
    loadWikiArticles();
    loadScript('select2.full.min.js');


    $(() => {
        $('#visualiseSite').click(() => {
            if ($("#wikiArticle").val() === "") {
                //Error Message
                $('#error_msg').show();
            } else {
                $('#error_msg').hide();
                exec($('#wikiArticle').val());
            }
        });
    });
});

function loadScript(name) {
    $.getScript(`/extensions/SemanticMediaWikiGraph/includes/js/${name}`, (data, textStatus, jqxhr) => {
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
        success(data) {
            if (data?.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data?.error) {
                alert(data);
                // debugger;
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
                    hlink: `./${data.query.subject.split("#")[0]}`
                });
                focalNodeID = data.query.subject;
                for (const item of data.query.data) {

                    if (!["_SKEY", "_MDAT", "_ASK"].includes(item.property)) {
                        if (item.dataitem[0].item === data.query.subject) {
                            item.dataitem[0].item = `${item.dataitem[0].item}_${item.property}`;
                        }
                        for (let j = 0; j < item.dataitem.length; j++) {
                            const type = getNodeTypeName(item.property, item.dataitem[j].type);
                            if (type === 'Boolean') {
                                item.dataitem[j].item = item.dataitem[j].item === 't' ? 'true' : 'false';
                            }
                            if (type === 'URI') {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type,
                                    hlink: item.dataitem[0].item
                                });
                            } else if (type === "Internal Link") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type,
                                    hlink: `./${item.dataitem[j].item.split("#")[0]}`
                                });
                            } else if (type === "Date") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.substring(2),
                                    type,
                                });
                            } else {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type,
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
                const elem = $(`[id=${focalNodeID}] a`);
                elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
            }
        }
    });

}

function getNodeTypeName(name, type) {
    switch (name) {
        case "_boo":
            return "Boolean";
        case "_cod":
            return "Code";
        case "_dat":
            return "Date";
        case "_ema":
            return "Email";
        case "_num":
            return "Number"; //oder Email //oder Telefon
        case "_qty":
            return "Quantity";
        case "_rec":
            return "Record";
        case "_tem":
            return "Temperature";
        case "_uri":
            return "URI";
        case "_wpg":
            return "Internal Link";
        case "Monolingual":
            return "Monolingual Text";
        case "Telephone":
            return "Telephone";
        case "_TEXT":
            return "Text";
        case "_INST":
            return "Category";
        default:
            switch (type) {
                case 1:
                    return "Number";
                case 2:
                    return "Text";
                case 4:
                    return "Boolean";
                case 5:
                    return "URI"; //oder Email //oder Telefon
                case 6:
                    return "Date";
                case 9:
                    return "Internal Link";
                default:
                    return "Unknown Type";
            }
    }
}


function nicePropertyName(name) {
    switch (name) {
        case "_boo":
            return "Boolean";
        case "_cod":
            return "Code";
        case "_dat":
            return "Date";
        case "_ema":
            return "Email";
        case "_num":
            return "Number"; //oder Email //oder Telefon
        case "_qty":
            return "Quantity";
        case "_rec":
            return "Record";
        case "_tem":
            return "Temperature";
        case "_uri":
            return "URI";
        case "_wpg":
            return "Internal Link";
        case "Monolingual":
            return "Monolingual Text";
        case "Telephone":
            return "Telephone";
        case "_TEXT":
            return "Text";
        case "_INST":
            return "isA";
        default:
            return name.replace("_", " ");
    }
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
        success(data) {
            if (data?.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data?.error) {
                alert(data);
                // debugger;
            } else {
                done.push(wikiArticle);

                focalNodeID = data.query.subject;
                nodeSet.forEach((item) => {
                    if (item.id === focalNodeID) {
                        item.fixed = true;
                    }
                });
                for (const item of data.query.data) {

                    if (item.property.indexOf("_") !== 0) {
                        if (item.dataitem[0].item === data.query.subject) {
                            item.dataitem[0].item = `${item.dataitem[0].item}_${item.property}`;
                        }
                        for (let j = 0; j < item.dataitem.length; j++) {
                            const type = getNodeTypeName(item.property, item.dataitem[j].type);
                            if (type === 'Boolean') {
                                item.dataitem[j].item = item.dataitem[j].item === 't' ? 'true' : 'false';
                            }
                            if (type === 'URI') {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type,
                                    hlink: item.dataitem[0].item
                                });
                            } else if (type === "Internal Link") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type,
                                    hlink: `./${item.dataitem[0].item}`
                                });
                            } else if (type === "Date") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.substring(2),
                                    type,
                                });
                            } else {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type,
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
    const newArr = [];

    array.forEach((item) => {
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
        success(data) {
            if (data?.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data?.error) {
                alert(data);
                // debugger;
            } else {
                for (const item of data.query.backlinks) {
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
    const newArr = [];
    array.forEach((item) => {
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
        success(data) {
            if (!(!(data?.edit && data.edit.result === 'Success') && !(data?.error))) {
                return;
            }
            const dataArray = data.query.allpages;
            for (const dataElement of dataArray) {
                $('#wikiArticle').append(`<option value="${dataElement.title}">${dataElement.title}</option>`);
            }

            $("#wikiArticle").select2({
                placeholder: "Select a Wiki Article",
                allowClear: true
            });
        }
    });
}

function colorScaleMW(type) {
    return color[type];
}


function hideElements() {
    $(".node").each(function (index, el) {
        const invIndex = invisibleType.indexOf(el.__data__.type);
        if (!(invIndex > -1)) {
            return;
        }
        $(this).toggle();
        const invIndexNode = invisibleNode.indexOf(el.__data__.id);
        if (invIndexNode === -1) {
            invisibleNode.push(el.__data__.id);
        }


    });

    $(".gLink").each(function (index, el)
    {
        //      debugger;
        const valSource = el.__data__.sourceId;
        const valTarget = el.__data__.targetId;
        let indexEdge = invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

        const indexSource = invisibleNode.indexOf(valSource);
        const indexTarget = invisibleNode.indexOf(valTarget);
        indexEdge = invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

        if (indexEdge > -1) {
            //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
            $(this).toggle();
            //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
        } else if ((indexSource > -1 || indexTarget > -1)) {
            //Knoten sind nicht unsichtbar, aber Kante ist es
            $(this).toggle();
            invisibleEdge.push(`${valSource}_${valTarget}_${el.__data__.linkName}`);
        }
    });
}