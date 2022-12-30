// import $ from "jquery";
// @ts-ignore
import mw from "types-mediawiki/*";
import d3 from "d3";

class MyClass {
    static invisibleNode: any[] = [];
    static invisibleEdge: string[] = [];
    static invisibleType: any[] = [];
    static done: any[] = [];
    static focalNodeID = '';
    static nodeSet: { id: any; name: any; type: string; fixed?: boolean; x?: number; y?: number; hlink?: any; }[] = [];
    static linkSet: { sourceId: any; linkName: any; targetId: any; }[] = [];
    static force: { links: () => any; nodes: () => any; drag: any; stop: () => void; };
    static color = {
        InternalLink: '#1f77b4',
        Category: '#071f55',
        URI: '#17a8cf',
        Telephone: '#13d1e3',
        Email: '#75d3dd',
        Number: '#2ca02c',
        Quantity: '#114911',
        Temperature: '#b6e75a',
        MonolingualText: '#f2cd0c',
        Text: '#ff7f0e',
        Code: '#b37845',
        Boolean: '#d62728',
        Date: '#d62790',
        Record: '#8927d6'
    };

    private static wikiArticleElement: JQuery;

    constructor() {
        MyClass.wikiArticleElement = $('#wikiArticle');
        MyClass.initialize();
    }

    static initialize(): void {
        MyClass.loadWikiArticles();
        MyClass.loadScript('select2.full.min.js');

        $(() => {
            $('#visualiseSite').click(() => {
                if (MyClass.wikiArticleElement.val() === '') {
                    // Error Message
                    $('#error_msg').show();
                } else {
                    $('#error_msg').hide();
                    MyClass.exec(MyClass.wikiArticleElement.val());
                }
            });
        });
    }


    public static loadScript(name: string) {
        $.getScript(`/extensions/SemanticMediaWikiGraph/includes/js/${name}`, (/** @type {any} */ data: any, /** @type {any} */ textStatus: any, /** @type {any} */ jqxhr: any) => {
        });
    }


    public static exec(wikiArticle: any) {
        MyClass.done = [];
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'browsebysubject',
                subject: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            /**
             * @param {{ edit: { result: string; }; error: any; query: { subject: string; data: any; }; }} data
             */
            success: function (data: { edit: { result: string; }; error: any; query: { subject: string; data: any; }; }) {
                if (data?.edit && data.edit.result === 'Success') {
                    // debugger;
                } else if (data?.error) {
                    alert(data);
                    // debugger;
                } else {
                    MyClass.nodeSet = [];
                    MyClass.linkSet = [];
                    MyClass.done.push(wikiArticle);
                    MyClass.nodeSet.push(({
                        id: data.query.subject,
                        name: data.query.subject.split("#")[0].replace("_", " "),
                        type: "Internal Link",
                        fixed: true,
                        x: 10,
                        y: 0,
                        hlink: `./${data.query.subject.split("#")[0]}`
                    }) as any);
                    MyClass.focalNodeID = data.query.subject;
                    for (const item of data.query.data) {

                        if (!["_SKEY", "_MDAT", "_ASK"].includes(item.property)) {
                            if (item.dataitem[0].item === data.query.subject) {
                                item.dataitem[0].item = `${item.dataitem[0].item}_${item.property}`;
                            }
                            for (let j = 0; j < item.dataitem.length; j++) {
                                const type = MyClass.getNodeTypeName(item.property, item.dataitem[j].type);
                                if (type === 'Boolean') {
                                    item.dataitem[j].item = item.dataitem[j].item === 't' ? 'true' : 'false';
                                }
                                if (type === 'URI') {
                                    MyClass.nodeSet.push(
                                        {
                                            id: item.dataitem[j].item,
                                            name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                            hlink: item.dataitem[0].item,
                                            type: null
                                        });
                                } else if (type === "Internal Link") {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                        type: null,
                                        hlink: `./${item.dataitem[j].item.split("#")[0]}`
                                    });
                                } else if (type === "Date") {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.substring(2),
                                        type: null,
                                    });
                                } else {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                        type: null,
                                        //hlink: "./" + item.dataitem[0].item
                                    });
                                }
                                MyClass.linkSet.push({
                                    sourceId: data.query.subject,
                                    linkName: MyClass.nicePropertyName(item.property),
                                    targetId: item.dataitem[j].item
                                });
                            }

                        }

                    }
                    //backlinks(wikiArticle);
                    //und Ask wer hierhin zeigt?
                    $('#cluster_chart .chart').empty();
                    MyClass.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                    const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
                    // @ts-ignore
                    elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                    // @ts-ignore
                    elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
                }
            }
        });

    }

    public static getNodeTypeName(name: string, type: number) {
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


    public static nicePropertyName(name: string): string {
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


    public static askNode(wikiArticle: any) {
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'browsebysubject',
                subject: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            /**
             * @param {{ edit: { result: string; }; error: any; query: { subject: string; data: any; }; }} data
             */
            success(data: { edit: { result: string; }; error: any; query: { subject: string; data: any; }; }) {
                if (data?.edit && data.edit.result === 'Success') {
                    // debugger;
                } else if (data?.error) {
                    alert(data);
                    // debugger;
                } else {
                    MyClass.done.push(wikiArticle);

                    MyClass.focalNodeID = data.query.subject;
                    MyClass.nodeSet.forEach((item) => {
                        if (item.id === MyClass.focalNodeID) {
                            item.fixed = true;
                        }
                    });
                    for (const item of data.query.data) {

                        if (item.property.indexOf("_") !== 0) {
                            if (item.dataitem[0].item === data.query.subject) {
                                item.dataitem[0].item = `${item.dataitem[0].item}_${item.property}`;
                            }
                            for (let j = 0; j < item.dataitem.length; j++) {
                                const type = MyClass.getNodeTypeName(item.property, item.dataitem[j].type);
                                if (type === 'Boolean') {
                                    item.dataitem[j].item = item.dataitem[j].item === 't' ? 'true' : 'false';
                                }
                                if (type === 'URI') {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                        type: null,
                                        hlink: item.dataitem[0].item
                                    });
                                } else if (type === "Internal Link") {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                        type: null,
                                        hlink: `./${item.dataitem[0].item}`
                                    });
                                } else if (type === "Date") {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.substring(2),
                                        type: null,
                                    });
                                } else {
                                    MyClass.nodeSet.push({
                                        id: item.dataitem[j].item,
                                        name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                        type: null,
                                        //hlink: "./" + item.dataitem[0].item
                                    });
                                }
                                MyClass.linkSet.push({
                                    sourceId: data.query.subject,
                                    linkName: MyClass.nicePropertyName(item.property),
                                    targetId: item.dataitem[j].item
                                });
                            }

                        }

                    }
                    MyClass.force.stop();
                    //  backlinks(wikiArticle);

                    $('#cluster_chart .chart').empty();
                    //  var k = cloneNode(nodeSet);
                    //  var m = cloneEdge(linkSet);
                    MyClass.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                    //drawCluster.update();
                    MyClass.hideElements();
                }
            }
        });

    }


    public static cloneNode(array: any[]) {
        /**
         * @type {{ id: any; name: any; type: any; hlink?: any; }[]}
         */
        const newArr: { id: any; name: any; type: any; hlink?: any; }[] = [];

        array.forEach((/** @type {{ hlink: string; id: any; name: any; type: any; }} */ item: { hlink: string; id: any; name: any; type: any; }) => {
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


    public static backlinks(wikiArticle: any) {
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'query',
                list: 'backlinks',
                bltitle: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            /**
             * @param {{ edit: { result: string; }; error: any; query: { backlinks: any; }; }} data
             */
            success(data: { edit: { result: string; }; error: any; query: { backlinks: any; }; }) {
                if (data?.edit && data.edit.result === 'Success') {
                    // debugger;
                } else if (data?.error) {
                    alert((data) as any);
                    // debugger;
                } else {
                    for (const item of data.query.backlinks) {
                        MyClass.nodeSet.push({
                            id: item.title,
                            name: item.title,
                            type: 'Unknown',
                            hlink: item.title
                        });

                        MyClass.linkSet.push({
                            sourceId: item.title,
                            linkName: 'Unknown',
                            targetId: MyClass.focalNodeID
                        });
                    }

                }

                $('#cluster_chart .chart').empty();
                //  var k = cloneNode(nodeSet);
                //  var m = cloneEdge(linkSet);
                MyClass.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                //drawCluster.update();
                MyClass.hideElements();
            }
        });
    }


    public static cloneEdge(array: any[]) {
        /**
         * @type {{ sourceId: any; linkName: any; targetId: any; }[]}
         */
        const newArr: { sourceId: any; linkName: any; targetId: any; }[] = [];
        array.forEach((/** @type {{ sourceId: any; linkName: any; targetId: any; }} */ item: { sourceId: any; linkName: any; targetId: any; }) => {
            newArr.push({
                sourceId: item.sourceId,
                linkName: item.linkName,
                targetId: item.targetId
            });
        });

        return newArr;
    }


    public static loadWikiArticles() {
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'query',
                list: 'allpages',
                aplimit: 1000,
                format: 'json'
            },
            type: 'GET',
            /**
             * @param {{ edit: { result: string; }; error: any; query: { allpages: any; }; }} data
             */
            success(data: { edit: { result: string; }; error: any; query: { allpages: any; }; }) {
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

    /**
     * @param {string} type
     */
    public static colorScaleMW(type: string) {
        return MyClass.color[type];
    }


    public static hideElements() {
        $(".node").each(function (index, el: CustomHTMLElement) {
            const invIndex = MyClass.invisibleType.indexOf(el.__data__.type);
            if (!(invIndex > -1)) {
                return;
            }
            $(this).toggle();
            const invIndexNode = MyClass.invisibleNode.indexOf(el.__data__.id);
            if (invIndexNode === -1) {
                MyClass.invisibleNode.push(el.__data__.id);
            }


        });

        $(".gLink").each(function (index, el: CustomHTMLElement) {
            //      debugger;
            const valSource = el.__data__.sourceId;
            const valTarget = el.__data__.targetId;
            let indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

            const indexSource = MyClass.invisibleNode.indexOf(valSource);
            const indexTarget = MyClass.invisibleNode.indexOf(valTarget);
            indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

            if (indexEdge > -1) {
                //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
                $(this).toggle();
                //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
            } else if ((indexSource > -1 || indexTarget > -1)) {
                //Knoten sind nicht unsichtbar, aber Kante ist es
                $(this).toggle();
                MyClass.invisibleEdge.push(`${valSource}_${valTarget}_${el.__data__.linkName}`);
            }
        });
    }

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

        // Color Scale Handling...
        let colorScale: any;
        switch (colors) {
            case "colorScale10":
                colorScale = d3.schemeCategory10;
                break;
            case "colorScale20":
                colorScale = d3.schemeCategory20;
                break;
            case "colorScale20b":
                colorScale = d3.schemeCategory20b;
                break;
            case "colorScale20c":
                colorScale = d3.schemeCategory20c;
                break;
            default:
                colorScale = d3.schemeCategory20c;
        }

        let width = $(".chart")[0].clientWidth;
        let height = $(".chart")[0].clientHeight;
        const centerNodeSize = 50;
        const nodeSize = 10;
        const color_hash = [];
        let scale = 1;

        const clickLegend = function () {

            const thisObject = d3.select(this);
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

        const typeMouseOver = function () {

            const thisObject = d3.select(this);
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

        const typeMouseOut = function () {

            const thisObject = d3.select(this);
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


        const mouseClickNode = function () {
            const thisObject = d3.select(this);
            const typeValue = thisObject.attr("type_value");

            if (!clickText && typeValue === 'Internal Link') {
                const n = thisObject[0][0].__data__.name;
                if (!MyClass.done.includes(n)) {
                    MyClass.askNode(n);
                }

            }

            clickText = false;

        };

        const mouseClickNodeText = function () {

            let win: any;
            const thisObject = d3.select(this);
            const typeValue = thisObject.attr("type_value");

            if (typeValue === 'Internal Link') {
                //    var win = window.open("index.php/" + thisObject[0][0].__data__.hlink);
                let win = window.open(thisObject[0][0].__data__.hlink);
            } else if (typeValue === 'URI') {
                let win = window.open(thisObject[0][0].__data__.hlink);
            }

            clickText = true;
        };


        const nodeMouseOver = function () {

            const thisObject = d3.select(this);
            const typeValue = thisObject.attr("type_value");
            const strippedTypeValue = typeValue.replace(/ /g, "_");

            d3.select(this).select("circle").transition()
                .duration(250)
                .attr("r", (d: any, i) => d.id === MyClass.focalNodeID ? 65 : 15);
            d3.select(this).select("text").transition()
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

        const nodeMouseOut = function () {

            const thisObject = d3.select(this);
            const typeValue = thisObject.attr("type_value");
            const colorValue = thisObject.attr("color_value");
            const strippedTypeValue = typeValue.replace(/ /g, "_");

            d3.select(this).select("circle").transition()
                .duration(250)
                .attr("r", (d: { id: string; }, i: any) => d.id === MyClass.focalNodeID ? centerNodeSize : nodeSize);
            d3.select(this).select("text").transition()
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

        // Create a hash that maps colors to types...
        nodeSetApp.forEach((d: any, i: any) => {
            color_hash[d.type] = d.type;
            //document.writeln(color_hash[d.type]);
        });

        function keys(obj: any) {
            const keys = [];

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    keys.push((key) as any);
                }
            }
            return keys;
        }

        const sortedKeys = keys(color_hash).sort();

        sortedKeys.forEach((d, i) => {
            color_hash[d] = MyClass.colorScaleMW(String(d));
            //document.writeln(color_hash[d]);
        });

        // Add colors to original node records...
        nodeSetApp.forEach((d: any, i: any) => {
            d.color = color_hash[d.type];
            //document.writeln(d.type);
        });

        const svgCanvas = d3.select(selectString)
            .append("svg:svg")
            .call(d3.zoom().on("zoom", () => {
                scale = d3.event.transform.k;
                svgCanvas.attr("transform", d3.event.transform);
            }))
            .attr("width", width)
            .attr("height", height)
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
            .force("center", d3.forceCenter(width / 2, height / 2))
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
            .attr("color_value", (d: any, i) => color_hash[d.type])
            .attr("xlink:href", (d: any) => d.hlink)
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            .on("mouseover", nodeMouseOver)
            .on("click", mouseClickNode)
            .on("mouseout", nodeMouseOut)
            // .call(force.drag)
            .append("a");

        // Append circles to Nodes
        node.append("circle")
            //.attr("x", function(d) { return d.x; })
            //.attr("y", function(d) { return d.y; })
            .attr("r", (d: any) => d.id === MyClass.focalNodeID ? centerNodeSize : nodeSize)
            .style("fill", "White") // Make the nodes hollow looking
            //.style("fill", "transparent")
            .attr("type_value", (d: any, i) => d.type)
            .attr("color_value", (d: any, i) => color_hash[d.type])
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
            .style("stroke", (d: any, i) => color_hash[d.type]) // Node stroke colors
        // .call(force.drag);

        // Append text to Nodes
        node.append("text")
            .attr("x", (d: any) => d.id === MyClass.focalNodeID ? 0 : 20)
            .attr("y", (d: any) => {
                return d.id === MyClass.focalNodeID ? 0 : -10;
            })
            .attr("text-anchor", (d: any) => d.id === MyClass.focalNodeID ? "middle" : "start")
            .on("click", mouseClickNodeText)
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue")
            .style("fill", (d: any, i) => color_hash[d])
            .attr("type_value", (d: any, i) => d.type)
            .attr("color_value", (d: any, i) => color_hash[d.type])
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
                    const s = 1 / scale;
                    return d.x = Math.max(60, Math.min(s * ($(".chart")[0].clientWidth - 60), d.x));
                } else {
                    const s = 1 / scale;
                    return d.x = Math.max(20, Math.min(s * ($(".chart")[0].clientWidth - 20), d.x));
                }


            })
                .attr("cy", (d: any) => {
                    if (d.id === MyClass.focalNodeID
                    ) {
                        const s = 1 / scale;
                        return d.y = Math.max(60, Math.min(s * ($(".chart")[0].clientHeight - 60), d.y));
                    } else {
                        const s = 1 / scale;
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
            .data(sortedKeys).enter().append("svg:circle") // Append circle elements
            .attr("cx", 20)
            .attr("cy", (d: any, i) => (45 + (i * 20)))
            .attr("stroke-width", ".5")
            .style("fill", (d: any, i) => color_hash[d])
            .attr("r", 6)
            .attr("color_value", (d: any, i) => color_hash[d])
            .attr("type_value", (d: any, i) => d)
            .attr("index_value", (d: any, i) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendBullet-${strippedString}`;
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
            .attr("y", (d: any, i) => (45 + (i * 20)))
            .attr("dx", 0)
            .attr("dy", "4px") // Controls padding to place text in alignment with bullets
            .text((d: any) => d)
            .attr("color_value", (d: any, i) => color_hash[d])
            .attr("type_value", (d: any, i) => d)
            .attr("index_value", (d: any, i) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendText-${strippedString}`;
            })
            .style("fill", "Black")
            .style("font", "normal 14px Arial")
            .on('mouseover', typeMouseOver)
            .on("mouseout", typeMouseOut);


        const updateWindow = function () {
            width = $(".chart")[0].clientWidth - 60;
            height = $(".chart")[0].clientHeight - 60;

            svgCanvas.attr("width", width).attr("height", height);
            $('#svgCanvas').width(width + 90);
            $('#svgCanvas').height(height + 60);
            // }

            d3.select(window).on('resize.updatesvg', updateWindow);
        }

    }
}
