var QueryBuilder, async, tree;

async = require("async");

QueryBuilder = (function() {
  function QueryBuilder(defquery, deforder, query, cb) {
    this.defquery = defquery;
    this.query = query.query;
    this.order = query.order || deforder || {
      order: 1
    };
    this.fields = query.fields;
    this.limit = query.limit;
    this.skip = query.skip;
    this.populate = query.populate || null;
    this.cb = cb;
  }

  QueryBuilder.prototype.getQuery = function(query) {
    query = query.where(this.defquery);
    if (this.query) {
      query = query.where(this.query);
    }
    if (this.fields) {
      query = query.select(this.fields);
      query = query.select("parents depth parent order");
    }
    query = query.sort(this.order);
    if (this.limit) {
      query = query.limit(this.limit);
    }
    if (this.skip) {
      query = query.skip(this.skip);
    }
    if (this.populate) {
      query = query.populate(this.populate);
    }
    if (this.cb) {
      return query.exec(this.cb);
    } else {
      return query;
    }
  };

  return QueryBuilder;

})();

tree = function(schema, options) {
  var makeTree;
  options = options || {
    mapLimit: 5
  };
  schema.add({
    parent: {
      type: "ObjectId",
      "default": null
    }
  });
  schema.add({
    parents: {
      type: [
        {
          type: "ObjectId"
        }
      ],
      required: false
    }
  });
  schema.add({
    depth: {
      type: "number",
      "default": 0
    }
  });
  schema.add({
    order: {
      type: "number",
      "default": 0
    }
  });
  schema.virtual("children").get(function() {
    return this.__children;
  });
  schema.virtual("children").set(function(v) {
    return this.__children = v;
  });
  schema.path('parent').set(function(v) {
    this.__parent = this.parent;
    this.__parents = this.parents;
    this.__depth = this.depth;
    return v;
  });
  schema.pre("save", function(next, done) {
    var self, treeChange, updateChilds;
    self = this;
    treeChange = self.isModified("parent");
    if ((!self.isNew) && (!treeChange)) {
      return next();
    }
    if (self.isNew && !self.parent) {
      self.parents = [];
      self.depth = 0;
      return next();
    }
    if (self.isNew && self.parent) {
      self.constructor.findById(self.parent, {
        _id: 1,
        parents: 1
      }).exec(function(err, parent) {
        if (err || !parent) {
          self.invalidate("parent", "Parent not found");
          return done(new Error("Parent not found"));
        }
        self.parents = [].concat(parent.parents, parent._id);
        self.depth = self.parents.length;
        return next();
      });
      return;
    }
    if ((!self.isNew) && treeChange) {
      updateChilds = function() {
        return self.constructor.find({
          parent: self._id
        }, function(err, childs) {
          return async.mapLimit(childs, options.mapLimit, function(doc, cb) {
            doc.parents = [].concat(self.parents, self._id, doc.parents.slice(self.depth + 1));
            console.log("New path", self.parents);
            doc.depth = self.parents.length;
            return doc.save(cb);
          }, function(err, results) {
            return next();
          });
        });
      };
      return self.constructor.findById(self.parent, {
        _id: 1,
        parents: 1
      }).exec(function(err, parent) {
        if (err || !parent) {
          self.invalidate("parent", "Parent not found");
          return done(new Error("Parent not found"));
        }
        self.parents = [].concat(parent.parents, parent._id);
        self.depth = self.parents.length;
        return updateChilds();
      });
    }
  });
  schema.pre("remove", function(next) {
    var self;
    self = this;
    return self.constructor.remove({
      parents: self._id
    }, function(err) {
      return next();
    });
  });
  schema["static"]("GetRoots", function(args, cb) {
    var qb;
    qb = new QueryBuilder({
      parent: null
    }, null, args, cb);
    return qb.getQuery(this.find());
  });
  schema.method("getChildren", function(args, cb) {
    var qb;
    qb = new QueryBuilder({
      parent: this._id
    }, {
      order: 1
    }, args, cb);
    return qb.getQuery(this.constructor.find());
  });
  schema["static"]("GetChildren", function(item, args, cb) {
    var qb;
    qb = new QueryBuilder({
      parent: item._id || item
    }, {
      order: 1
    }, args, cb);
    return qb.getQuery(this.find());
  });
  makeTree = function(pages, args, cb) {
    var i, idx, j, len, len1, page, result;
    if (pages === null) {
      return cb(null, []);
    }
    if (args.flat) {
      return cb(null, pages);
    }
    idx = {};
    result = [];
    for (i = 0, len = pages.length; i < len; i++) {
      page = pages[i];
      idx[page._id] = page;
    }
    for (j = 0, len1 = pages.length; j < len1; j++) {
      page = pages[j];
      if (idx[page.parent] != null) {
        if (args.indexed) {
          if (idx[page.parent].children == null) {
            idx[page.parent].children = {};
          }
          idx[page.parent].children[page._id] = page;
        } else {
          if (idx[page.parent].children == null) {
            idx[page.parent].children = [];
          }
          idx[page.parent].children.push(page);
        }
      } else {
        result.push(page);
      }
    }
    return cb(null, result);
  };
  schema.method("getTree", function(args, cb) {
    var qb, qry, self;
    self = this;
    qry = {
      parents: self._id
    };
    if ((args.depth != null) && args.depth > 1) {
      qry["depth"] = {
        $lte: self.depth + args.depth
      };
    } else {
      return this.getChildren(args, cb);
    }
    qb = new QueryBuilder(qry, {
      parents: 1,
      order: 1
    }, args);
    return qb.getQuery(this.constructor.find()).exec(function(err, items) {
      return makeTree(items, args, cb);
    });
  });
  return schema["static"]("GetTree", function(item, args, cb) {
    var qb, qry;
    if (item === null) {
      if ((args.depth != null) && args.depth > 1) {
        qry = {
          depth: {
            $lte: args.depth
          }
        };
      } else {
        qry = {};
      }
      qb = new QueryBuilder(qry, {
        parents: 1,
        order: 1
      }, args);
      return qb.getQuery(this.find()).exec(function(err, pages) {
        return makeTree(pages, args, cb);
      });
    } else if (item._id) {
      return item.getTree(args, cb);
    } else {
      return this.findOne({
        _id: item
      }, function(err, item) {
        if (err || !item) {
          cb(null, []);
        }
        return item.getTree(args, cb);
      });
    }
  });
};

module.exports = tree;
