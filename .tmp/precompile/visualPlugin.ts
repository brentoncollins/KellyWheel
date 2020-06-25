import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var crm73679E7311844C1EB9DB7D2AEF0B9221: IVisualPlugin = {
    name: 'crm73679E7311844C1EB9DB7D2AEF0B9221',
    displayName: 'crm',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["crm73679E7311844C1EB9DB7D2AEF0B9221"] = crm73679E7311844C1EB9DB7D2AEF0B9221;
}

export default crm73679E7311844C1EB9DB7D2AEF0B9221;