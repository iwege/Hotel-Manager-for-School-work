/**
  Copyright (C) 2011 by Josh Perez
  https://github.com/goatslacker/Snake

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

// ##Snake
//
// Constructs a new Snake object
//
// **Config** is an Object with the following parameters:
//
// * __name__ is the name of the database
// * __size__ is the size in bytes the data will take up
// * __description__ (optional)
// * __version__ any number, describe the version of the database. eg: 1.0
//
// **Schema** is an Object representing the model of your data
//
// A typical Schema looks like this:
//
//     {
//       "Siblings": {
//         "tableName": "siblings",
//           "columns": {
//           "name": { "type": "TEXT" },
//           "age": { "type": "INTEGER" }
//         }
//       }
//     }
//
// **preQueries** is an Array of SQL queries that Snake should execute prior to creating the tables
//
//
// Snake will construct the schema as a Collection and create the tables. Once it's finished it will
// return a new Object with direct access to the tables in the schema as well as an **SQL** method in it's prototype.
var Snake = function (config, schema, preQueries) {
// intialize the SYSTEM Object which will house our config and schema
// and ARRAY which will contain all of the queries while the system isn't ready
  var system = this.SYSTEM = {};
  this.ARRAY = [];
  system.config = config || {};

  preQueries = preQueries || [];

// keep track of the models
// and the queries
// and we create a pointer to hasOwnProperty, because that word is too long.
  var models = [];
  var queries = [];

  var has = "hasOwnProperty";

// Now we loop through the schema
// and create a new SQL store for each table
//
// `model.map` is the map of the model
//
// `_id` and `_date` are default properties that each object gets
  Object.keys(schema).forEach(function (table) {
    var model = schema[table];

    var sql = {
      fields: [],
      foreign: []
    };

    model.jsName = table;

    model.map = [];

    model.columns._id = { type: "INTEGER", extra: "PRIMARY KEY AUTOINCREMENT" };
    model.columns._date = { type: "INTEGER" };

// Here we loop through each column in the table
// `field` contains the field's type and any extra properties
//
// then we add to SQL
// and store the map information
    Object.keys(model.columns).forEach(function (column) {
      var field = model.columns[column];

      sql.fields.push(column + " " + field.type + (field.extra ? " " + field.extra : ""));

// If it's a foreign key, then we capture the foreign table
// and the key it points to
// and we create SQL for the foreign key
      if ("foreign" in field) {
        model.foreign = {};

        (function applyForeignKey() {
          var fk = field.foreign.split(".");
          model.foreign[fk[0]] = [column, fk[1]];

          sql.foreign.push("FOREIGN KEY (" + column + ") REFERENCES " + fk[0] + "(" + fk[1] + ")");
        }());
      }

      model.map.push(column);
    });

    queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{body})", {
      table: model.tableName,
      body: sql.fields.concat(sql.foreign).join(", ")
    }));

    models.push(model);

// create a VQL Collection Object
    this[model.tableName] = new Snake.collection(model, this);
  }.bind(this));

// create the tables if they don't exist
  this.SQL(preQueries.concat(queries), null);
};

// ### Interpolation
//
// Need I say more? Used internally by Snake.
Snake.interpolate = function (str, obj) {
  Object.keys(obj).forEach(function (prop) {
    if (obj.hasOwnProperty(prop)) {
      str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
    }
  });

  return str;
};

// ### Connect
//
// #### Connects to the database
//
// * __onComplete__ is the callback function
Snake.prototype.connect = function (onComplete) {
  var system = this.SYSTEM;
  var db = system.config;

  onComplete = onComplete || function () {};

// HTML5 openDatabase
  system.database = openDatabase(db.name, db.version, db.displayName, db.size);

// If the database isn't connected then we return an error
// otherwise we return true, set `connected` to true and freeze the `SYSTEM`
// object so we make it immutable.
// If there are any queries in the pool
// we query them now
  if (!system.database) {
    onComplete("Could not open database");
  } else {
    onComplete(null, true);
    system.connected = true;
    Object.freeze(this.SYSTEM);

    this.ARRAY.forEach(function (args) {
      this.SQL.apply(this, args);
    }.bind(this));

    delete this.ARRAY;
  }
};

// ### SQL
//
// #### Performs an SQL query on the database
//
// * __query__ is the String query to perform
// * __params__ is an Array containing the parameters that go along with the query
// * __onComplete__ is the callback function
Snake.prototype.SQL = function (query, params, onComplete) {
  var system = this.SYSTEM;
  var array = this.ARRAY;

// If the system isn't connected yet
// we queue up the queries and then fire them once the system is ready
  if (!system.connected) {
    array.push([query, params, onComplete]);
    return this.connect();
  }

  params = params || null;
  onComplete = onComplete || function (transaction, results) {};

// HTML5 database perform query
  system.database.transaction(function (transaction) {

    if (!Array.isArray(query)) {
      query = [query];
    }

    /** @private */
    var callback = function (transaction, results) {
      var result = null,
          rows = null,
          err = null,
          i = 0,
          max = 0;

      try {
        result = results.insertId;
      } catch (e) {
        if (e.name === "INVALID_ACCESS_ERR" && e.code === 15) {
          result = [];
          rows = results.rows;

          if (rows.length > 0) {
            for (i, max = rows.length; i < max; i += 1) {
              result.push(rows.item(i));
            }
          }
        } else {
          err = e;
        }
      }

      onComplete(err, result);
    };

// For each query
// we append a semicolon to query
// and then perform query
// and then we pass the transaction to the callback
    query.forEach(function (q) {
      var preparedQuery = q + ";";

      transaction.executeSql(preparedQuery, params, callback, function (transaction, results) {
        onComplete(transaction);
      });
    });

  });

};
// ## Snake.Collection
//
// Used by Snake to create a collection.
//
// A collection contains all the query methods for each table.
Snake.collection = function (schema, snake) {

// Available Selector _constant_ types
  var SELECTORS = {
    "EQUAL":          "=",
    "NOT_EQUAL":      "<>",
    "GREATER_THAN":   ">",
    "LESS_THAN":      "<",
    "GREATER_EQUAL":  ">=",
    "LESS_EQUAL":     "<=",
    "ISNULL":         "IS NULL",
    "ISNOTNULL":      "IS NOT NULL",
    "LIKE":           "LIKE",
    "NOTLIKE":        "NOT LIKE",
    "IN":             "IN",
    "NOTIN":          "NOT IN",
    "LEFT_JOIN":      "LEFT JOIN"
  };

  var Collection = {};

// Resets the query once it's been completed
  var resetObj = function () {
    Collection.sql = {
      distinct: false,
      persist: true,
      select: [],
      from: schema.tableName,
      joins: [],
      where: {
        criterion: [],
        params: []
      },
      orderBy: [],
      groupBy: [],
      limit: false
    };
  };

// Function used to build the where statement for queries
  var addWhere = function (field, value, selector) {
    var q = [];

    selector = selector || SELECTORS.EQUAL;

    if (field in schema.columns) {
      field = schema.tableName + "." + field;
    }

// Here we treat some selectors as special cases
// like `IN` and `NOTIN` which requires the values to be in a list delimited by commas
    switch (selector) {
    case SELECTORS.ISNULL:
    case SELECTORS.ISNOTNULL:
      Collection.sql.where.criterion.push(field + " " + selector);
      break;

    case SELECTORS.IN:
    case SELECTORS.NOTIN:
      value.forEach(function (val) {
        q.push("?");
      });

      Collection.sql.where.criterion.push(field + " " + selector + " (" + q.join(", ") + ")");
      break;

    default:
      Collection.sql.where.criterion.push(field + " " + selector + " ?");
    }

    if (value) {
      if (Array.isArray(value)) {
        Collection.sql.where.params = Collection.sql.where.params.concat(value);
      } else {
        Collection.sql.where.params.push(value);
      }
    }
  };

// Builds the query and passes it onto this.SQL for processing
  var queryBuilder = function (sql, query, onComplete) {
    var params = null,
        interpolate = Snake.interpolate;

    query = query || {};

// Adds the `FROM` portion of the SQL query
    query.from = schema.tableName;

    if (Collection.sql.joins.length > 0) {
      sql = sql + " " + Collection.sql.joins.join(" ");
    }

// Creates the `WHERE` part by joining all of the where with `AND` keyword
    if (Collection.sql.where.criterion.length > 0) {
      sql = sql + " WHERE #{where}";
      query.where = Collection.sql.where.criterion.join(" AND ");

      params = Collection.sql.where.params;
    }

// Adds the `ORDER BY` elements
    if (Collection.sql.orderBy.length > 0) {
      sql = sql + " ORDER BY #{orderBy}";
      query.orderBy = Collection.sql.orderBy;
    }

// Adds the `GROUP BY` elements
    if (Collection.sql.groupBy.length > 0) {
      sql = sql + " GROUP BY #{groupBy}";
      query.groupBy = Collection.sql.groupBy;
    }

// Adds any `LIMIT`s && `OFFSET`s
    if (Collection.sql.limit) {
      if (Collection.sql.offset) {
        sql = sql + " LIMIT #{offset}, #{limit}";
        query.offset = Collection.sql.offset;
      } else {
        sql = sql + " LIMIT #{limit}";
      }

      query.limit = Collection.sql.limit;
    }

// Now we run the query
// and use the callback to return the results
// and then we make sure to reset all the fields
    if (Collection.sql.persist) {
      snake.SQL(interpolate(sql, query), params, onComplete);

    } else {
      if (onComplete) {
        onComplete(null, interpolate(sql, query), params);
      }
    }

    resetObj();
  };

// The Collection constructor
//
// returns _this_ in order to chain calls
  Collection = {
// ### Select
//
// #### Adds select columns to the query
//
// Example:
//
//     SELECT nebulas, black_holes, stars FROM galaxies;
//
// is
//
//     db
//      .galaxies
//      .select("nebulas", "black_holes", "stars")
//      .doSelect(callback);
//
// returns {Object} this
    select: function () {
      var self = this;

      Array.prototype.forEach.call(arguments, function (args) {
        if (schema.columns.hasOwnProperty(args)) {
          self.sql.select.push(schema.tableName + "." + args);
        }
      });

      return this;
    },

    toSQL: function (persist) {
      if (typeof persist === "undefined") {
        persist = this.sql.persist;
      }
      this.sql.persist = !persist;
      return this;
    },

// ### Distinct
//
// #### Prefixes the SQL statement with DISTINCT in order to filter out the duplicate entries
//
// Example:
//
//     SELECT DISTINCT nebulas, black_holes, stars FROM galaxies;
//
// is
//
//     db
//      .galaxies
//      .distinct("nebulas", "black_holes", "stars")
//      .doSelect(callback);
//
// returns {Object} this
    distinct: function () {
      this.sql.distinct = true;
      this.select.apply(this, arguments);
      return this;
    },

// ### Find
//
// #### Filters the results by the criteria specified
//
// Example:
//
//     SELECT * FROM fruits WHERE name = 'mango';
//
// is
//
//     db.fruits.find({ name: "mango" }).doCount(callback);
//
// or
//
//     db.fruits.find("name", "mango").doCount(callback);
//
// returns {Object} this
    find: function () {
      var args = Array.prototype.slice.call(arguments, 0),
          field = null,
          value = null,
          selector = null;

// If we're passing in each argument then
// the first argument is the field
// the second argument _should_ be the value
// unless the second argument is actually a selector
// otherwise the third argument is the selector
      if (args.length > 1) {
        field = args[0];
        value = args[1];

        if (value in SELECTORS) {
          selector = SELECTORS[value];

        } else {
          selector = SELECTORS[args[2]] || SELECTORS.EQUAL;
        }

        addWhere(field, value, selector);

// If we're not passing in each argument then
// we check if the first argument is a number and if so then
// we retrieve by PK
// otherwise we assume it's an object and we loop through each field
// the value of `args[0][field]` is the property of the field.
      } else {

        if (typeof(args[0]) === "number") {

          addWhere("_id", args.shift());

        } else {

          Object.keys(args[0]).forEach(function (field) {
            var tmp = null;

            value = args[0][field];

// Here we determine which selector we'll be using
// and that depends on the DataType of the value
//
// * If the value is an Array then we perform an IN query
// * If the value is a Regular Expression then we perform a LIKE query
// * If the value is an Object then we need to loop through all the items in the object and set them for the current field
// * By default the selector is `EQUAL`
            switch (Object.prototype.toString.call(value)) {
            case "[object Array]":
              selector = SELECTORS.IN;
              addWhere(field, value, selector);
              break;

            case "[object RegExp]":
              selector = SELECTORS.LIKE;
              tmp = value.toString();
              value = tmp;
              tmp = value.replace(/\W/g, "");

              if (value.substr(1, 1) === '^') {
                value = tmp + '%';
              } else if (value.substr(-2, 1) === '$') {
                value = '%' + tmp;
              } else {
                value = '%' + tmp + '%';
              }

              addWhere(field, value, selector);
              break;

            case "[object Object]":
              Object.keys(value).forEach(function (tmp) {
                selector = SELECTORS[tmp] || SELECTORS.EQUAL;
                addWhere(field, value[tmp], selector);
              });
              break;

            default:
              selector = SELECTORS.EQUAL;
              addWhere(field, value, selector);
            }
          });

        } // typeof num

      } // endif

      return this;
    },

// ### Order By
//
// #### Orders the result set in ascending or descending order by a column
//
// * __obj__ are the fields to order by along with their order
//
// Example
//
//     SELECT * FROM tasks ORDER BY priority DESC;
//
// is
//
//     db.tasks.orderBy({ priority: 'desc' }).doSelect(callback);
//
// returns {Object} this
    orderBy: function (obj) {
      var self = this;

      Object.keys(obj).forEach(function (column) {
        var sortOrder = obj[column].toUpperCase();
        if (schema.columns.hasOwnProperty(column)) {
          column = schema.tableName + "." + column;
        }
        self.sql.orderBy.push(column + " " + sortOrder);
      });

      return this;
    },

// ### Group By
//
// #### Groups results by a column specified
//
// Example:
//
//     SELECT * FROM population GROUP BY ethnicity;
//
// is
//
//     db.population.groupBy('ethnicity');
//
// returns {Object} this
    groupBy: function () {
      var self = this,
          args = Array.prototype.slice.call(arguments, 0);

      args.forEach(function (column) {
        var prepared_column = null;

        if (schema.columns.hasOwnProperty(column)) {
          prepared_column = schema.tableName + "." + column;
          self.sql.groupBy.push(prepared_column);
        }
      });

      return this;
    },

// ### Join
//
// #### Joins two tables together using the table's primary and foreign keys
//
// * __table__ is the table to join on
//
// * __on__ is an Array which contains the primary key and the foreign key [pk, fk]
//
// * __join_method__ is the method we'll use to join the tables, defaults to `LEFT_JOIN`
//
// returns {Object} this
    join: function (table, on, join_method) {
      var interpolate = Snake.interpolate;

      join_method = SELECTORS[join_method] || SELECTORS.LEFT_JOIN;

      if (!on) {
        if ("foreign" in schema && table in schema.foreign) {
          this.sql.joins.push(interpolate("#{join_method} #{foreign_table} ON #{table}.#{primary_key} = #{foreign_table}.#{foreign_key}", {
            join_method: join_method,
            foreign_table: table,
            table: schema.tableName,
            primary_key: schema.foreign[table][0],
            foreign_key: schema.foreign[table][1]
          }));
        }
      } else {
        this.sql.joins.push(interpolate("#{join_method} #{foreign_table} ON #{table}.#{primary_key} = #{foreign_table}.#{foreign_key}", {
          join_method: join_method,
          foreign_table: table,
          table: schema.tableName,
          primary_key: on[0],
          foreign_key: on[1]
        }));
      }

      return this;
    },

// ### Offset
//
// #### Provides an offset or 'skips' a number of records
//
// * __offset__ is the number of records we'll skip
//
// Example
//
//     SELECT * FROM cars LIMIT 5, 10;
//
// is
//
//     db
//      .cars
//      .offset(5)
//      .limit(10)
//      .doSelect(callback);
//
// returns {Object} this
    offset: function (offset) {
      this.sql.offset = offset;
      return this;
    },

// ### Limit
//
// #### Limits the return result set to a set number of records
//
// * __limit__ The number of records to return
//
// Example
//
// `SELECT * FROM cars LIMIT 10;`
//
// is
//
//     vql.cars.limit(10).doSelect(callback);
//
// returns {Object} this
    limit: function (limit) {
      this.sql.limit = limit;
      return this;
    },

// ### retrieveByPK
//
// #### Asynchronous call that retrieves one record by the current collection's primary key
//
// * __pk__ is the primary key to retrieve from the database
// * __onComplete__ is the function to callback once the operation completes successfully
    retrieveByPK: function (pk, onComplete) {
      this.find(pk).doSelectOne(onComplete);
    },

// ### doSelectOne
//
// #### Retrieves one record from the database from the specified criteria
//
// * __onComplete__ is the function to callback once the operation completes successfully
    doSelectOne: function (onComplete) {
      this.limit(1).doSelect(this.sql.persist ? function (err, rows) {
        if (onComplete) {
          try {
            if (rows.length > 0) {
              onComplete(err, rows[0]);
            } else {
              onComplete(null, null);
            }
          } catch (e) {
            onComplete(e);
          }
        }
      } : onComplete);
    },

// ### doCount
//
// #### Returns the number of records for a given criteria
//
// * __onComplete__ is the function to callback once the operation completes successfully
// * __useDistinct__ is a boolean parameter, if true the `COUNT` is performed using distinct
    doCount: function (onComplete, useDistinct) {
      useDistinct = ((useDistinct || this.sql.distinct === true) && this.sql.select.length > 0) ? "DISTINCT " : "";
      var sql = "SELECT COUNT(" + useDistinct + "#{select}) AS count FROM #{from}",
          callback = null,
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.select;
      }

      if (this.sql.persist === false) {
        callback = onComplete;
      } else {
        /** @private */
        callback = function (err, results) {
          var obj = results[0];

          if (onComplete) {
            onComplete(err, obj.count);
          }
        };
      }

      queryBuilder(sql, query, callback);
    },

// ### doDelete
//
// #### Deletes an object from the database
//
// * __onComplete__ is the function to callback once the operation completes successfully
    doDelete: function (onComplete) {
      queryBuilder("DELETE FROM #{from}", null, onComplete);
    },

// ### doSelect
//
// #### Returns an Array of objects for the specified criteria
//
// * __onComplete__ is the function to callback once the operation completes successfully
    doSelect: function (onComplete) {
      var sql = "SELECT #{select} FROM #{from}",
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.distinct ? "DISTINCT " : "";
        query.select = query.select + this.sql.select;
      }

      queryBuilder(sql, query, onComplete);
    },

// ### save
//
// #### Saves a record to the database
//
// * __onComplete__ is the callback to execute if the transaction completes successfully
    save: function (obj, onComplete) {
      obj = (typeof obj)[0] === "f" ? obj() : obj;

      var sql = "",
          q = [],
          params = [],
          interpolate = Snake.interpolate;

// Here we iterate through the schema's map and push all the values into a parameters Array
// and then we create the `INSERT OR REPLACE INTO` query and pass that along with the parameters to this.SQL
// if the primary key already exists then it's replaced, otherwise the row is inserted.
      schema.map.forEach(function (map) {
        var val = obj[map] || null;

        if (map === '_date' && val === null) {
          val = Date.now();
        }

        params.push(val);
        q.push("?");
      });

      sql = interpolate("INSERT OR REPLACE INTO '#{table}' (#{columns}) VALUES (#{q})", {
        table: schema.tableName,
        columns: schema.map,
        q: q
      });

      if (this.sql.persist === true) {
        snake.SQL(sql, params, onComplete);
      } else {
        if (onComplete) {
          onComplete(null, sql, params);
        }
      }

      resetObj();
    },

// ### destroy
//
// #### Deletes a record from the database
//
// * __onComplete__ is the callback to execute if the transaction completes successfully
    destroy: function (obj, onComplete) {
      var val = "";

      switch (typeof obj) {
      case "function":
        val = obj();
        val = val._id;
        break;
      case "object":
        val = obj._id;
        break;
      default:
        val = obj;
      }

      if (val) {
        this.find(val).doDelete(onComplete);
      }

      resetObj();
    }

  };

  resetObj();

  return Collection;
};
