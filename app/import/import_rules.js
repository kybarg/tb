var fs = require('fs');

function RuleFile(file) {
    this.file = file;
    try {
        this.rules = JSON.parse(fs.readFileSync(file));
    } catch (e) {

    }
}

RuleFile.prototype.save = function () {
    fs.writeFileSync(this.file, JSON.stringify(this.rules));
}

RuleFile.prototype.addRule = function (path, rule, regEx) {
    this.save();
}

RuleFile.prototype.removeRule = function (rule) {

}

RuleFile.prototype.getRule = function (name) {
    for (var i = 0; i < this.rules.product.param.length; i++) {
        if (this.rules.product.param[i].name == name) {
            return this.rules.product.param[i];
        }
    }
    return undefined;
}

RuleFile.prototype.getValue = function (rule, value) {
    var checkEx = function (val, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (new RegExp(arr[i], 'i').test(val)) {
                return true;
            }
        }
        return false;
    }

    for (var i = 0; i < rule.compare.length; i++) {
        if (rule.compare[i].match.indexOf(value) != -1 || checkEx(value, rule.compare[i].matchEx)) {
            return rule.compare[i].value;
        }
    }
    return undefined;
}

var ruleList = new RuleFile('import/rules/rules.json');

module.exports = ruleList;