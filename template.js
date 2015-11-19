template = {
    tempaltes: {},
    add: function (name, func) {
        this.tempaltes[name] = func;
    },
    get: function (name, dir) {
        if (this.tempaltes[name]) {
            console.log('including ' + name);
            return this.tempaltes[name];
        } else if (dir) {
            console.log('including ' + (dir + '/' + name.replace(/^(\.\/)+/i, '')));
            return this.tempaltes[dir + '/' + name.replace(/^(\.\/)+/i, '')];
        } else {
            throw Error('Unknow file to include ' + name);
        }
    }
};


