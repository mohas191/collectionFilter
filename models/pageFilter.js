export default class pageFilter {
    constructor(datalist, action,value,limitValue,offsetValue){
        this.originalList = datalist;
        this.datalist = datalist;
        this.action = action;
        this.limitValue = limitValue;
        this.offsetValue = offsetValue;
        this.value = value;
        this.compute()
    }
    compute(){
        if (this.action == "limit"){
            this.datalist = this.limit();
        }
            
        if(this.action == "offset"){
            this.datalist = this.offset();
        }
        if(this.action == "multi")
        {
            let a = this.multi();
            //console.log(JSON.stringify(a) + " // ");
            //let b = new pageFilter(a,"limit",this.limitValue);
            //console.log(JSON.stringify(b.get()));
            this.datalist = a;//b.get();
        }
    }
    // limit(){
    //     let dl = this.datalist;
    //     let newTab = [];
    //     dl.forEach(element => {
    //         if(newTab.length < this.value){
    //             newTab.push(element);
    //         }
    //     });
    //     console.log(newTab);
    //     return newTab;
    // }
    // offset(){
    //     let dl = this.datalist;
    //     let newTab = [];
    //     let count = 0;
    //     dl.forEach(element => {
    //         if(count < this.value){
    //             count += 1;
    //         } else{newTab.push(element);}
    //     });
    //     console.log(newTab);
    //     return newTab;}
    get(){
        return this.datalist;
    }

    multi(){
        let datalist = this.originalList;
        console.log(this.limitValue + " "+this.offsetValue);
        let chuncks = []; //https://stackoverflow.com/questions/8495687/split-array-into-chunks
        for (let i = 0; i < datalist.length; i += this.limitValue) {
            const chunk = datalist.slice(i, i + this.limitValue);
            chuncks.push(chunk);
        }

        let offsetBon = chuncks[this.offsetValue];
        this.datalist = offsetBon;
        return offsetBon;
    }
}