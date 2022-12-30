interface CustomHTMLElement extends HTMLElement {
    __data__: {
        linkName: string;
        targetId: string;
        sourceId: string;
        id: string;
        type: string;
        px: number;
        py: number;
    };
}


interface CustomDto {
    source: string | number | boolean;
    target: string | number | boolean;
        linkName: string;
        targetId: string;
        sourceId: string;
        id: string;
        type: string;
        px: number;
        py: number;
}