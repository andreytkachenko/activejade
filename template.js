template = {
    tempaltes: {},
    add: function (name, func) {
        this.tempaltes[name] = func;
    },
    get: function (name) {
        return this.tempaltes[name];
    }
};


