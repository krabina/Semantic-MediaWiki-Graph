import d3 from "d3";

export class ColorHelper
{
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

    public static colorScaleMW(type: string) {
        return this.color[type];
    }

    public static color_hash = [];

    public static GetColor(colors: string)
    {
        let colorScale: string[];
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
    }

    public static GetColors(colors: any, nodeSetApp: any) {
        // Color Scale Handling...
        ColorHelper.GetColor(colors);

        // Create a hash that maps colors to types...
        nodeSetApp.forEach((d: any, i: any) => {
            this.color_hash[d.type] = d.type;
        });

        const sortedColors = ColorHelper.keys(this.color_hash).sort();

        sortedColors.forEach((d: string, i) => {
            this.color_hash[d] = ColorHelper.colorScaleMW(d);
            //document.writeln(color_hash[d]);
        });


        // Add colors to original node records...
        nodeSetApp.forEach((d: any, i: any) => {
            d.color = this.color_hash[d.type];
            //document.writeln(d.type);
        });
        return sortedColors;
    }

    public static keys(obj: any)
    {
        const keys = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push((key) as any);
            }
        }
        return keys;
    }
}