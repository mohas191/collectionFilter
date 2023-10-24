// import mathsCalculator from '../models/mathsCalculator.js';
import HttpContext from '../httpContext.js';
import Repository from './repository.js';
import Model from './model.js';
import pageFilter from "./pageFilter.js";
export default class CollectionFilter {
    check(paramName) {
        if (paramName == "") { return [false]; }
        if (this.params[paramName] != undefined) {
            return [true, this.params[paramName]];
        }
        return [false];
    }
    constructor(objList, xHttpContext, model) {
        this.xHttpContext = xHttpContext;
        this.objList = objList;
        this.httpc = xHttpContext;
        this.params = [];
        this.model = model;
        //let xparams = xHttpContext.path.params;
        // for (const key in xparams) {
        //     if (Object.hasOwnProperty.bind(xparams)(key)) {
        //         const lowered = key.toLowerCase();
        //         this.params[lowered] = xparams[key];
        //     }
        // }
        this.params = lowerize(xHttpContext.path.params != undefined ? xHttpContext.path.params : []);
        // console.log(this.params);
        this.ruleset = {};
        this.init();
        console.log(this.ruleset);
    }
    isNumber(val) {
        return !isNaN(val);
    }
    init() {
        let fieldsTab = [];
        let supported = { "sort": "s", "name": "s", "category": "s", "field": "s", "limit": "n", "offset": "n" };
        for (const paramName in supported) {//supported.forEach(paramName => {
            let inputtype = supported[paramName];
            let [checkresult, checkvalue] = this.check(paramName);
            // console.log(checkresult + " "+checkvalue);
            if (checkresult) {
                let xval = "";
                if (inputtype == "s") {
                    xval = checkvalue.toString();
                } else if (inputtype == "n") {
                    if (this.isNumber(parseFloat(checkvalue)))
                        xval = parseFloat(checkvalue);
                }
                this.ruleset[paramName] = xval != undefined ? xval : undefined;
            }
        };
        Object.keys(this.params).forEach(k=>{
            if(!(k in supported))
                fieldsTab.push(k);
        });
        this.fieldsTab = fieldsTab;
    }
    get() {
        let dataList = [...this.objList];
        this.dataList = dataList;
        let pageFilterUse = false;
        
        // console.log(this.ruleset);
        //ici il faut retourner une nouvelle liste, la nouvelle liste doit être la dataList incluant les filtres supporté
        let errorList = [];
        for (const rule in this.ruleset) {
            let rulevalue = this.ruleset[rule];
            let success = false;
            switch (rule) {
                case "sort":
                    success = this.sort(this.dataList, rulevalue);
                    if (success != true) { errorList.push(this.sortError != undefined ? this.sortError : "Sort error"); } break;
                case "name":
                    success = this.name(this.dataList, rulevalue);
                    if (success != true) { errorList.push(this.nameError != undefined ? this.nameError : "Name error"); } break;
                case "category":
                    success = this.category(this.dataList, rulevalue);
                    if (success != true) { errorList.push(this.categoryError != undefined ? this.categoryError : "category error"); } break;
                case "field":
                    success = this.field(this.dataList, rulevalue);
                    if (success != true) { errorList.push(this.fieldError != undefined ? this.fieldError : "field error"); } break;
                case "limit" || "offset":
                    pageFilterUse = true; break;
                // case "offset":
                //     success = this.offset(this.dataList, rulevalue);
                //     if (success != true) { errorList.push(this.offsetError!= undefined? this.offsetError : "offset error"); } break;
            }
        };
        if (pageFilterUse) {
            let xsuccess = this.pageFilter(this.dataList);
            if (xsuccess != true) { errorList.push(this.limitError != undefined ? this.limitError : "pageFilter (limit & offset) error"); }
        }
        if (errorList.length != 0) {
            console.log("errorList: " + JSON.stringify(errorList));
        }
        return this.dataList;
    }
    sort(dataList, rulevalue) {
        let newlist = [...dataList]
        //let name: String = rulevalue;
        let tabparam = rulevalue.split(",");
        let keyword = tabparam[0];
        //console.log(tabparam);
        let desc = false;
        if (tabparam.indexOf("desc") != -1)
            desc = true;

        //console.log(modelHasKey(this.model,keyword));
        if (modelHasKey(this.model, keyword) == false) { //this.model.fields[keyword] == undefined){
            //console.log(this.model);
            this.sortError = "Keyword is unknown to model";
            return false;
        }
        newlist.sort((a, b) => {
            // console.log(JSON.stringify(a) + " /"+ keyword);
            //console.log(a + " "+ b + " /" + keyword)localhost:5000/api/bookmarks?offset=1&limit=5&sort=Id
            let ax = a[keyword];
            let bx = b[keyword];
            if (typeof (a) == "string") {
                ax = a[keyword].toUpperCase();
            } if (typeof (b) == "string") {
                bx = b[keyword].toUpperCase();
            }
            if (ax < bx) {
                if (desc == false)
                    return -1;
                else
                    return 1;
            }
            if (ax > bx) {
                if (desc == false)
                    return 1;
                else
                    return -1;
            }
            return 0;
        });
        // console.log("newList: " + JSON.stringify(newlist));
        this.dataList = newlist;
        return true;
    }
    name(dataList, rulevalue) {
        let dl = dataList;
        let newTab = [];
        dl.forEach(element => {
            if (valueMatch(element["Title"], rulevalue)) {//element["name"] == rulevalue){
                newTab.push(element);
            }
        });
        this.dataList = newTab;
        return true;
    }
    category(dataList, rulevalue) {
        let dl = dataList;
        let newTab = [];
        dl.forEach(element => {
            if (element["Category"] == rulevalue)
                newTab.push(element);
        });
        this.dataList = newTab;
        return true;
    }
    field(dataList, rulevalue) { //problemes
        let dl = [...dataList];
        let newTab = [];
        // dl.forEach(element => {
        //     if (newTab.indexOf(element[rulevalue]) == -1)
        //         newTab.push(element[rulevalue]);
        // });
        dl.forEach(element =>{
            Object.keys(this.fieldsTab).forEach(f=>{
                if(valueMatch(element[f],this.params[f]))
                    newTab.push(element);
            });
        });
        
        this.dataList = newTab;
        return true;
    }
    // limit(dataList, rulevalue) {
    //     let pfil = new pageFilter(dataList,"limit",rulevalue);
    //     this.dataList = pfil.get();
    //     //console.log(pfil.get());
    //     return true;
    // }
    // offset(dataList, rulevalue) {
    //     let pfil = new pageFilter(dataList,"multi",rulevalue,this.ruleset["limit"]);
    //     this.dataList = pfil.get();
    //     //console.log(pfil.get());
    //     return true;
    // }
    pageFilter(dataList) {
        let dl = dataList;
        let pfil = new pageFilter(dataList, "multi", undefined,this.ruleset["limit"], this.ruleset["offset"]);
        this.dataList = pfil.get();
        return true;
    }
}

function valueMatch(value, searchValue) {
    try {
        let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
        return new RegExp(exp).test(value.toString().toLowerCase());
    } catch (error) {
        console.log(error);
        return false;
    }
}
function compareNum(x, y) {
    if (x === y) return 0;
    else if (x < y) return -1;
    return 1;
}
function innerCompare(x, y) {
    if ((typeof x) === 'string')
        return x.localeCompare(y);
    else
        return compareNum(x, y);
}
const lowerize = obj => //https://www.30secondsofcode.org/js/s/lowerize/
    Object.keys(obj).reduce((acc, k) => {
        acc[k.toLowerCase()] = obj[k];
        return acc;
    }, {});

function modelHasKey(model, key) {
    //console.log(model.fields);
    let found = false;
    model.fields.forEach(element => {
        if (element.name == key) { //element.hasOwnProperty(key)) {
            found = true;
        }
    });
    return found;
}