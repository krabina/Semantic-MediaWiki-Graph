// import $ from "jquery";
// @ts-ignore
import mw from "types-mediawiki/*";
import {Utility} from "./utility";

class Created
{
    constructor(sourceId: any, linkName: any, targetId: any) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
    }

    public sourceId: any;
    public linkName: any;
    public targetId: any;
}

export class MyClass {
    static invisibleNode: any[] = [];
    static invisibleEdge: string[] = [];
    static invisibleType: any[] = [];
    static done: any[] = [];
    static focalNodeID = '';
    static nodeSet: { id: any; name: any; type: string; fixed?: boolean; x?: number; y?: number; hlink?: any; }[] = [];
    static linkSet: Created[] = [];
    static force: { links: () => any; nodes: () => any; drag: any; stop: () => void; };

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
            success: execSuccessCallback
        });


        function execSuccessCallback(data: { edit: { result: string; }; error: any; query: { subject: string; data: any; }; }) {
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
                Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
                // @ts-ignore
                elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                // @ts-ignore
                elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
            }
        }

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
                    Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                    //drawCluster.update();
                    MyClass.hideElements();
                }
            }
        });

    }


    public static cloneNode(array: any[]) {
        const newArr: { id: any; name: any; type: any; hlink?: any; }[] = [];

        array.forEach((item: { hlink: string; id: any; name: any; type: any; }) => {
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
                Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                //drawCluster.update();
                MyClass.hideElements();
            }
        });
    }


    public static cloneEdge(array: Created[]) {

        const newArr: Created[] = [];
        array.forEach((item: Created) => {
            newArr.push(new Created(item.sourceId, item.linkName, item.targetId));
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
            let indexEdge: number;

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

}

